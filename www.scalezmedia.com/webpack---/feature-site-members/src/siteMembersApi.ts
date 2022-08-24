import { named, withDependencies, optional } from '@wix/thunderbolt-ioc'
import {
	Fetch,
	IFetchApi,
	ILogger,
	IPropsStore,
	IStructureAPI,
	LoggerSymbol,
	Props,
	SiteFeatureConfigSymbol,
	StructureAPI,
	ViewerModel,
	ViewerModelSym,
	ILanguage,
	BrowserWindowSymbol,
	BrowserWindow,
	MasterPageFeatureConfigSymbol,
	ITranslationsFetcher,
	Translate,
	WixBiSessionSymbol,
	WixBiSession,
	BusinessLoggerSymbol,
	LanguageSymbol,
	CurrentRouteInfoSymbol,
	Experiments,
	ExperimentsSymbol,
	FeatureStateSymbol,
	CaptchaApiSymbol,
} from '@wix/thunderbolt-symbols'
import { isSSR, getRuntimeStyleOverridesManager, getOpenCaptcha, ICaptchaApi } from '@wix/thunderbolt-commons'
import { ISessionManager, SessionManagerSymbol } from 'feature-session-manager'
import { Router, IRouter, IUrlHistoryManager, UrlHistoryManagerSymbol, ICurrentRouteInfo } from 'feature-router'
import { ISiteScrollBlocker, SiteScrollBlockerSymbol } from 'feature-site-scroll-blocker'
import { IPopups, PopupsSymbol } from 'feature-popups'
import { IReporterApi, ReporterSymbol } from 'feature-reporter'
import { uniqueId } from 'lodash'
import {
	INTERACTIONS /* , DIALOGS, NOTIFICATIONS */,
	PrivacyStatus,
	AUTH_RESULT_REASON,
	UNSUPPORTED_AGENTS_FOR_SOCIAL_AUTH,
	INVISIBLE_CAPTCHA_API_KEY,
} from './constants'
import { CommonProps, getDialogService, VerificationCodeProps } from './dialogService'
import { name } from './symbols'
import type {
	AuthenticationToken,
	IContactInfo,
	ISiteMembersApi,
	IStatus,
	LoginOptions,
	LoginResult,
	MemberDetails,
	SiteMembersSiteConfig,
	MemberDetailsDTO,
	SiteMembersMasterPageConfig,
	ViewModeProp,
	SocialAuthComponentProps,
	ILoginOptions,
	ISignUpOptions,
	IMemberPayload,
	RequestAuthorizedPagesResult,
	AuthorizedPages,
	RegisterResult,
	SiteMembersState,
	IEmailVerification,
} from './types'
import {
	memberDetailsFromDTO,
	hangingPromise,
	getPerformFetch,
	isLoginAcceptableError,
	isSignupAcceptableError,
	_getSocialAuthComponentProps,
	serializeContactInfo,
	sleep,
	getVisitorId,
	loadGoogleSdkScript,
	isVerificationCodeError,
} from './utils'
import { BsiManagerSymbol, BusinessLogger, IBsiManager } from 'feature-business-logger'
import { BIEvents } from './biEvents'
import { SMPopups } from './smPopups'
import { IFeatureState } from 'thunderbolt-feature-state'

// const serializeContactInfo: any = (args: any) => args
// While our `login`,`register` and related functions don't officially support returning authorized
// pages, we know that our implementation is capable of doing so, if explicitly requested.
// We use this internal type to convery this information only within this file so that we can use
// this hidden `pages` result throughout our implementation.
type ExtendedLoginResult = LoginResult & { pages?: AuthorizedPages }

const siteMembersApi = (
	siteFeatureConfig: SiteMembersSiteConfig,
	siteMembersMasterPageConfig: SiteMembersMasterPageConfig,
	featureState: IFeatureState<SiteMembersState>,
	fetchApi: IFetchApi,
	logger: ILogger,
	viewerModel: ViewerModel,
	sessionManager: ISessionManager,
	propsStore: IPropsStore,
	structureApi: IStructureAPI,
	language: ILanguage,
	browserWindow: BrowserWindow,
	router: IRouter,
	siteScrollBlocker: ISiteScrollBlocker,
	translationsFetcher: ITranslationsFetcher,
	urlHistoryManager: IUrlHistoryManager,
	businessLogger: BusinessLogger,
	wixBiSession: WixBiSession,
	popups: IPopups | undefined,
	reporter: IReporterApi = { trackEvent: () => 0 },
	currentRouteInfo: ICurrentRouteInfo,
	experiments: Experiments,
	captcha: ICaptchaApi,
	bsiManager?: IBsiManager
): ISiteMembersApi => {
	const runtimeStyleOverridesManager = getRuntimeStyleOverridesManager()
	const {
		shouldLoadInvisibleCaptcha,
		isCommunityInstalled,
		collectionExposure,
		protectedHomepage,
		smSessionCookie,
		memberInfoAppId,
		smcollectionId,
		isTemplate,
	} = siteFeatureConfig
	let { sm_efCookie } = siteFeatureConfig
	const isSiteIsWixInternal = collectionExposure === 'WixInternal'
	const metasiteAppDefinitionId = '22bef345-3c5b-4c18-b782-74d4085112ff'
	const svSession = sessionManager.getUserSession()!
	const metasiteInstance = sessionManager.getAppInstanceByAppDefId(metasiteAppDefinitionId)
	const getBiVisitorId = () => getVisitorId(sessionManager)
	const { smSettings, tpaApplicationIds, policyLinks } = siteMembersMasterPageConfig
	const isMemberInfoPage = memberInfoAppId && tpaApplicationIds[memberInfoAppId]

	const { siteRevision, metaSiteId, siteId, externalBaseUrl } = viewerModel.site
	const requestUrl = viewerModel.requestUrl
	const viewMode = viewerModel.viewMode

	const isUnsupportedAgentForSocialAuth =
		UNSUPPORTED_AGENTS_FOR_SOCIAL_AUTH.findIndex((ua) => browserWindow?.navigator?.userAgent?.includes(ua)) !== -1
	const isSocialAuthSupported = !isUnsupportedAgentForSocialAuth
	const isCustomLoginSocialAuthSupported = !isUnsupportedAgentForSocialAuth
	const platformizedLoginUrl = '/_api/wix-sm-webapp/v1/auth/login'
	const registerUrl = '/_api/wix-sm-webapp/v1/auth/signup'
	const authenticateSessionUrl = `/_api/wix-sm-webapp/tokens/verify/${metaSiteId}/${siteId}`
	const authorizeMemberPagesUrl = `${externalBaseUrl.replace(/\/$/, '')}/api/wix-sm/v1/authorize/${siteId}/pages`
	const logoutUrl = `/_api/wix-sm-webapp/tokens/logout/${metaSiteId}`
	const sendResetPasswordEmailUrl = '/_api/wix-sm-webapp/member/sendForgotPasswordMail'
	const changePasswordUrl = `/_api/wix-sm-webapp/member/changePasswordWithMailToken?metaSiteId=${metaSiteId}&collectionId=${smcollectionId}`
	const handleOauthTokenUrl = `/_api/wix-sm-webapp/social/token/handle?metaSiteId=${metaSiteId}&collectionId=${smcollectionId}`
	const sendSetPasswordEmailUrl = '/_api/wix-sm-webapp/members/v1/auth/members/send-set-password-email'
	const resendEmailVerificationUrl = '/_api/wix-sm-webapp/tokens/email/resend'

	const defaultDialog = smSettings.smFirstDialogLogin ? 'login' : 'signup'
	const {
		socialLoginFacebookEnabled,
		socialLoginGoogleEnabled,
		termsOfUse,
		privacyPolicy,
		codeOfConduct,
		customSignUpPageId,
		customSignInPageId,
	} = smSettings
	const joinCommunityCheckedByDefault = smSettings.joinCommunityCheckedByDefault ?? true

	let { smToken } = siteFeatureConfig
	let memberDetails = {} as MemberDetails
	let savedSessionToken = smSessionCookie
	let appDidMountCallback: (() => void) | null = null
	let appMounted = false

	const registerToAppDidMount = (cb: () => void) => {
		appDidMountCallback = cb
	}

	const getDialogOptions = () => {
		return {
			registerToAppDidMount,
			shouldWaitForAppDidMount: !appMounted,
		}
	}

	const onLoginCallbacks: { [callbackId: string]: () => void } = {}
	const onLogoutCallbacks: { [callbackId: string]: () => void } = {}
	const triggerCallbacks = (callbacks: { [callbackId: string]: () => void }) => {
		return Promise.all(
			Object.entries(callbacks).map(async ([callbackId, cb]) => {
				try {
					const result = await Promise.race([cb(), sleep(3000).then(() => '$$$timeout$$$')])

					if (result === '$$$timeout$$$') {
						throw new Error(`callback ${callbackId} timed out`)
					}
				} catch (e) {
					logger.captureError(e as Error, { tags: { feature: 'site-members' } })
				}
			})
		)
	}

	const biEvents = BIEvents({
		sessionManager,
		businessLogger,
		wixBiSession,
		viewMode: viewMode?.toUpperCase() as ViewModeProp,
		language,
	})
	biEvents.siteMembersFeatureLoaded()
	const onMemberDetailsRefresh: { [callbackId: string]: () => void } = {}
	const triggerOnMemberDetailsRefreshCallbacks = () => {
		return Promise.all(
			Object.values(onMemberDetailsRefresh).map(async (cb) => {
				try {
					await cb()
				} catch (e) {
					logger.captureError(e as Error, { tags: { feature: 'site-members' } })
				}
			})
		)
	}

	const performFetch = getPerformFetch(
		fetchApi,
		{
			credentials: 'same-origin',
			headers: {
				accept: 'application/json',
				'x-wix-site-revision': `${siteRevision}`,
				'x-wix-client-artifact-id': 'thunderbolt',
			},
		},
		viewerModel.requestUrl
	)

	const dialogService = getDialogService(propsStore, structureApi, siteScrollBlocker, browserWindow)
	const smPopups = new SMPopups(popups, () => {
		if (!shouldLoadInvisibleCaptcha || !experiments['specs.thunderbolt.shouldLoadInvisibleCaptcha']) {
			return
		}

		runtimeStyleOverridesManager.setItemCssOverrides(
			{ visibility: 'hidden' },
			'.grecaptcha-badge',
			browserWindow as NonNullable<BrowserWindow>
		)
	})
	const bsiRaw = bsiManager?.getBsi()
	// The bsi has a weird format: guid|pageNumber, we only need the guid
	const bsi = bsiRaw ? bsiRaw.split('|')[0] : '00000000-0000-0000-0000-000000000000'
	const api = {
		appDidMount() {
			if (appDidMountCallback) {
				appDidMountCallback()
			}
			appMounted = true
		},
		async login(
			email: string,
			password: string,
			options?: ILoginOptions,
			returnPages: boolean = false
		): Promise<ExtendedLoginResult> {
			reporter.trackEvent({
				eventName: 'CustomEvent',
				params: {
					eventCategory: 'Site members',
					eventAction: 'Log in Submit',
					eventLabel: 'Wix',
				},
			})

			try {
				const result = await api.performLogin(email, password, options)
				const loginResult = await api.handleLoginResponse(result, returnPages)

				reporter.trackEvent({
					eventName: 'CustomEvent',
					params: {
						eventCategory: 'Site members',
						eventAction: 'Log in Success',
						eventLabel: 'Wix',
					},
				})

				return loginResult
			} catch (error) {
				reporter.trackEvent({
					eventName: 'CustomEvent',
					params: {
						eventCategory: 'Site members',
						eventAction: 'Log in Failure',
						eventLabel: 'Wix',
					},
				})
				throw error
			}
		},
		async performLogin(
			email: string,
			password: string,
			options?: ILoginOptions
		): Promise<{
			member: MemberDetails
			token: string
		}> {
			const result = await performFetch(platformizedLoginUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					authorization: metasiteInstance || '',
				},
				body: JSON.stringify({
					email,
					password,
					recaptchaToken: options?.recaptchaToken,
					invisibleRecaptchaToken: options?.invisibleRecaptchaToken,
				}),
			})
			return { member: result.member, token: result?.session?.token }
		},
		async handleOauthToken(
			oauthToken: string,
			provider: string,
			mode: string,
			joinCommunityStatus?: string,
			returnPages: boolean = false
		): Promise<ExtendedLoginResult> {
			const visitorId = sessionManager.getVisitorId()
			logger.interactionStarted(INTERACTIONS.SOCIAL_APP_LOGIN)
			reporter.trackEvent({
				eventName: 'CustomEvent',
				params: {
					eventCategory: 'Site members',
					eventAction: 'Log in Submit',
					eventLabel: provider,
				},
			})

			try {
				const { payload }: { payload: IMemberPayload } = await performFetch(handleOauthTokenUrl, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						svSession,
						visitorId,
						token: oauthToken,
						provider,
						mode,
						lang: language.userLanguage,
						privacyStatus: joinCommunityStatus,
					}),
				})

				logger.interactionEnded(INTERACTIONS.SOCIAL_APP_LOGIN)

				// When the user signing up to a site with members approval requirement
				// we won't get an smSession but we would get `siteMembersDto` inside our payload
				let token, siteMemberDto
				if (payload.smSession) {
					siteMemberDto = payload.smSession.siteMemberDto
					token = payload.smSession.sessionToken
				}
				siteMemberDto = payload.siteMemberDto
				const member = memberDetailsFromDTO(siteMemberDto)
				const loginResult = await api.handleLoginResponse({ member, token }, returnPages)

				reporter.trackEvent({
					eventName: 'CustomEvent',
					params: {
						eventCategory: 'Site members',
						eventAction: 'Log in Success',
						eventLabel: provider,
					},
				})

				return loginResult
			} catch (error) {
				reporter.trackEvent({
					eventName: 'CustomEvent',
					params: {
						eventCategory: 'Site members',
						eventAction: 'Log in Failure',
						eventLabel: provider,
					},
				})
				throw error
			}
		},
		async handleSocialLoginResponse(
			payload: IMemberPayload,
			vendor: string,
			returnPages: boolean = false
		): Promise<ExtendedLoginResult> {
			// Login has already fully happened on the server at this point, so it makes sense
			// to log a complete interaction without waiting for anything.
			// This "noop" interaction and event pair is still needed to maintain compatibility
			// with the other form of social login as implemented in handleOauthToken above
			logger.interactionStarted(INTERACTIONS.SOCIAL_APP_LOGIN)
			logger.interactionEnded(INTERACTIONS.SOCIAL_APP_LOGIN)
			reporter.trackEvent({
				eventName: 'CustomEvent',
				params: {
					eventCategory: 'Site members',
					eventAction: 'Log in Submit',
					eventLabel: vendor,
				},
			})

			// When the user signing up to a site with members approval requirement
			// we won't get an smSession but we would get `siteMembersDto` inside our payload
			let token, siteMemberDto
			if (payload.smSession) {
				siteMemberDto = payload.smSession.siteMemberDto
				token = payload.smSession.sessionToken
			}
			siteMemberDto = payload.siteMemberDto
			const member = memberDetailsFromDTO(siteMemberDto)
			const loginResult = await api.handleLoginResponse({ member, token }, returnPages)

			reporter.trackEvent({
				eventName: 'CustomEvent',
				params: {
					eventCategory: 'Site members',
					eventAction: 'Log in Success',
					eventLabel: vendor,
				},
			})

			return loginResult
		},
		async handleLoginResponse(
			{ token, member }: { token?: string; member: MemberDetails },
			returnPages: boolean = false
		): Promise<ExtendedLoginResult> {
			const emailVerified = member.emailVerified

			if (!token && !emailVerified && member.status === 'ACTIVE') {
				// In case member need to activate himself via email approval
				return api.showConfirmationEmailDialog(member.id) as Promise<ExtendedLoginResult>
			} else if (!token) {
				// In case member need to wait for admin approval
				return api.showAdminApprovalDialog(member.loginEmail, 'login') as Promise<ExtendedLoginResult>
			} else {
				const pages = (await api.applySessionToken(token, member, returnPages)) as AuthorizedPages

				return { sessionToken: token, member, ...(returnPages ? { pages } : {}) }
			}
		},
		async promptLogin(
			loginOptions: Partial<LoginOptions> = {},
			isCloseable: boolean = smPopups.config?.isCloseable ?? true,
			returnPages: boolean = smPopups.config?.returnPages ?? false
		): Promise<ExtendedLoginResult> {
			const { mode, modal } = loginOptions
			const modeToDisplay = mode ?? defaultDialog
			const displayMode = modal ? 'popup' : 'fullscreen'
			// In case of previewing a template site we don't want to present the login/signup view but a notification
			if (isTemplate) {
				const translate = await translationsFetcher()
				await api.showNotificationDialog(
					translate(
						'siteMembersTranslations',
						'siteMembersTranslations_TEMPLATE_NOTIFICATION_TITLE',
						'Demo Mode'
					),
					translate(
						'siteMembersTranslations',
						'siteMembersTranslations_TEMPLATE_NOTIFICATION_MESSAGE',
						'To make this template yours, start editing it.'
					),
					translate('siteMembersTranslations', 'SMContainer_OK', 'OK')
				)
				return Promise.reject(AUTH_RESULT_REASON.CANCELED)
			}
			if (experiments['specs.thunderbolt.shouldLoadGoogleSdkEarly']) {
				loadGoogleSdkScript(
					browserWindow,
					language.userLanguage,
					shouldLoadInvisibleCaptcha && experiments['specs.thunderbolt.shouldLoadInvisibleCaptcha']
						? INVISIBLE_CAPTCHA_API_KEY
						: 'explicit'
				)
				if (shouldLoadInvisibleCaptcha && experiments['specs.thunderbolt.shouldLoadInvisibleCaptcha']) {
					setTimeout(() => {
						runtimeStyleOverridesManager.setItemCssOverrides(
							{ visibility: 'visible', 'z-index': 'var(--portals-z-index)' },
							'.grecaptcha-badge',
							browserWindow as NonNullable<BrowserWindow>
						)
					}, 1000)
				}
			}

			if (modeToDisplay === 'login') {
				return api.showLoginDialog(isCloseable, displayMode, returnPages)
			} else {
				return api.showSignUpDialog(isCloseable, displayMode, returnPages)
			}
		},
		promptForgotPassword(isCloseable: boolean = true): Promise<void> {
			return new Promise((resolve, reject) => {
				smPopups.assignRequestAuthenticationPromise(resolve, reject)
				const props: CommonProps = {
					isCloseable,
					directionByLanguage: language.directionByLanguage,
				}
				const actions = {
					onCloseDialogCallback() {
						biEvents.closingDialog('RequestResetPassword')
						dialogService.hideDialog()
						smPopups.rejectAuthenticationRequest()
					},
					onSubmitCallback(email: string) {
						return api.sendForgotPasswordMail(email).then(async () => {
							const translate = await translationsFetcher()
							const close = () => {
								smPopups.resolveAuthenticationRequest()
								resolve()
							}

							api.showNotificationDialog(
								translate(
									'siteMembersTranslations',
									'siteMembersTranslations_RESET_PASSWORD_CHECKEMAIL_TITLE',
									'Please Check Your Email'
								),
								translate(
									'siteMembersTranslations',
									'siteMembersTranslations_RESET_PASSWORD_CHECKEMAIL_TEXT',
									'We’ve emailed you a link to reset your password.'
								),
								translate(
									'siteMembersTranslations',
									'siteMembersTranslations_Reset_Password_OK',
									'Got It'
								),
								close,
								close
							)
						})
					},
				}
				const options = experiments['specs.thunderbolt.smModalsShouldWaitForAppDidMount']
					? getDialogOptions()
					: {}

				dialogService.displayDialog('RequestPasswordResetDialog', props, actions, options)
			})
		},
		/**
		 * @deprecated this has been superceded by requestAuthorizedPages and can be removed when we merge specs.thunderbolt.newAuthorizedPagesFlow
		 */
		async requestAuthentication(
			loginOptions: Partial<LoginOptions> = {}
		): Promise<{
			success: boolean
			token?: AuthenticationToken
			reason: string
		}> {
			if (savedSessionToken) {
				return { success: true, token: savedSessionToken, reason: AUTH_RESULT_REASON.ALREADY_LOGGED_IN }
			}

			try {
				// The dialog is not closeable if and only if the homepage is protected and login was prompted by navigation
				const isCloseable = !protectedHomepage
				const { sessionToken } = await api.promptLogin(loginOptions, isCloseable)
				return { success: true, token: sessionToken, reason: AUTH_RESULT_REASON.SUCCESS }
			} catch (reason) {
				return { success: false, reason: reason as string }
			}
		},
		// If a member is logged in, explictly request their authorized pages using `smToken` as the
		// auth header.
		// Otherwise, log the member in and return the authorized pages the can optionally be extracted
		// from the login process.
		async requestAuthorizedPages(loginOptions: Partial<LoginOptions> = {}): Promise<RequestAuthorizedPagesResult> {
			if (smToken) {
				const pages = await api.authorizeMemberPagesBySignedInstance(smToken)
				return {
					success: true,
					pages,
				}
			}

			try {
				// The dialog is not closeable if and only if the homepage is protected and login was prompted by navigation
				const isCloseable = !protectedHomepage
				smPopups.setConfig({ isCloseable, returnPages: true })
				const data = await api.promptLogin(loginOptions, isCloseable, true)
				smPopups.reset()
				return { success: true, pages: data.pages! }
			} catch (reason) {
				return { success: false, reason: reason as string }
			}
		},
		async applySessionToken(
			token: string,
			newMemberDetails?: MemberDetails,
			returnPages: boolean = false
		): Promise<void | AuthorizedPages> {
			logger.interactionStarted(INTERACTIONS.VERIFY_TOKEN)
			const { payload } = await performFetch(authenticateSessionUrl, {
				method: 'POST',
				body: `token=${token}`,
			})

			logger.interactionEnded(INTERACTIONS.VERIFY_TOKEN)

			await sessionManager.loadNewSession({ reason: 'memberLogin' })

			smToken = sessionManager.getSmToken() as string
			savedSessionToken = token

			memberDetails = newMemberDetails ?? ((await api.getMemberDetails()) as MemberDetails)

			await triggerCallbacks(onLoginCallbacks)
			if (returnPages) {
				return payload.pages as AuthorizedPages
			}
		},
		/**
		 * @deprecated this has been superceded by authorizeMemberPagesBySignedInstance and can be removed when we merge specs.thunderbolt.newAuthorizedPagesFlow
		 */
		async authorizeMemberPagesByCookie(): Promise<AuthorizedPages> {
			const options = isSSR(browserWindow)
				? {
						headers: {
							cookie: `smSession=${smSessionCookie}`,
						},
				  }
				: undefined
			const { authorizedPages } = await performFetch(authorizeMemberPagesUrl, options)

			return authorizedPages
		},
		/**
		 * @deprecated this has been superceded by authorizeMemberPagesBySignedInstance and can be removed when we merge specs.thunderbolt.newAuthorizedPagesFlow
		 */
		async authorizeMemberPagesByToken(token: string): Promise<AuthorizedPages> {
			// Due to a design flaw, we may sometime be provided with a token that's not valid
			// for this endpoint. This happens when the member is already logged in and the token
			// is the same as the one we have saved in the smSession cookie. In this case we 'cheat'
			// and delegate to authorizeMemberPagesByCookie which works fine with this token, provided
			// that it's sent via cookie.
			if (token === smSessionCookie) {
				return this.authorizeMemberPagesByCookie()
			}

			const { payload } = await performFetch(authenticateSessionUrl, {
				method: 'POST',
				body: `token=${token}`,
			})

			const { pages } = payload

			return pages
		},
		async authorizeMemberPagesBySignedInstance(instance: string): Promise<AuthorizedPages> {
			const options = {
				headers: {
					authorization: instance,
				},
			}
			const { authorizedPages } = await performFetch(authorizeMemberPagesUrl, options)

			return authorizedPages
		},
		async getMemberDetails(refreshCurrentMember: boolean = false): Promise<MemberDetails | null> {
			if (memberDetails.id && !refreshCurrentMember) {
				return memberDetails
			} else if (smToken) {
				const getMemberDetailsUrl = `/_api/wix-sm-webapp/member/${smToken}?collectionId=${smcollectionId}&metaSiteId=${metaSiteId}`
				const { payload } = await performFetch(getMemberDetailsUrl)

				memberDetails = memberDetailsFromDTO(payload)

				if (refreshCurrentMember) {
					await triggerOnMemberDetailsRefreshCallbacks()
				}

				return memberDetails
			}

			return null
		},
		async register(
			email: string,
			password: string,
			contactInfo?: IContactInfo,
			profilePrivacyStatus?: PrivacyStatus,
			defaultFlow?: boolean,
			returnPages?: boolean,
			recaptchaToken?: string,
			invisibleRecaptchaToken?: string,
			emailVerification?: IEmailVerification
		): Promise<RegisterResult & { pages?: AuthorizedPages }> {
			returnPages = returnPages ?? false
			try {
				logger.interactionStarted(INTERACTIONS.CODE_SIGNUP)
				reporter.trackEvent({
					eventName: 'CustomEvent',
					params: {
						eventCategory: 'Site members',
						eventAction: 'Sign up Submit',
						eventLabel: 'Wix',
					},
				})
				const body = {
					email,
					password,
					profilePrivacyStatus,
					contactInfo: serializeContactInfo(contactInfo || {}),
					defaultFlow,
					recaptchaToken,
					invisibleRecaptchaToken,
					emailVerification,
				}
				const {
					member,
					session,
				}: {
					session?: { token: string }
					member: MemberDetails
					approvalToken: string
				} = await performFetch(registerUrl, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						authorization: metasiteInstance || '',
					},
					body: JSON.stringify(body),
				})

				const emailVerified = member.emailVerified
				const sessionToken = session?.token
				const status: IStatus = member?.status === 'ACTIVE' ? 'ACTIVE' : 'PENDING'

				if (!sessionToken && !emailVerified && member.status === 'ACTIVE') {
					// In case member need to activate himself via email approval
					// TODO: I'm not sure it's right, I think `INTERACTIONS.DEFAULT_SIGNUP reach here as well.
					logger.interactionEnded(INTERACTIONS.CODE_SIGNUP)
					return api.showConfirmationEmailDialog(member.id) as Promise<RegisterResult>
				} else if ((defaultFlow && member?.status === 'APPLICANT') || !sessionToken) {
					// In case member need to wait for admin approval
					// TODO: I'm not sure it's right, I think `INTERACTIONS.DEFAULT_SIGNUP reach here as well.
					logger.interactionEnded(INTERACTIONS.CODE_SIGNUP)
					return api.showAdminApprovalDialog(email, 'signup') as Promise<RegisterResult>
				} else {
					const pages = await api.applySessionToken(sessionToken, member, returnPages)

					// TODO: I'm not sure it's right, I think `INTERACTIONS.DEFAULT_SIGNUP reach here as well.
					logger.interactionEnded(INTERACTIONS.CODE_SIGNUP)
					reporter.trackEvent({
						eventName: 'CustomEvent',
						params: {
							eventCategory: 'Site members',
							eventAction: 'Sign up Success',
							eventLabel: 'Wix',
						},
					})
					reporter.trackEvent({
						eventName: 'CompleteRegistration',
						params: {
							origin: 'Site members',
							method: 'Wix',
						},
					})
					return { member, status, sessionToken, ...(returnPages && pages ? { pages } : {}) }
				}
			} catch (error) {
				reporter.trackEvent({
					eventName: 'CustomEvent',
					params: {
						eventCategory: 'Site members',
						eventAction: 'Sign up Failure',
						eventLabel: 'Wix',
					},
				})

				if (isVerificationCodeError(error)) {
					logger.interactionStarted(INTERACTIONS.VERIFICATION_CODE)
					const { details } = error
					const { applicationError } = details
					const { data } = applicationError

					const componentProps = {
						email,
						password,
						profilePrivacyStatus,
						contactInfo,
						defaultFlow,
						recaptchaToken,
						invisibleRecaptchaToken,
						emailVerification: {
							verificationId: data?.verificationId,
							otp: '',
						},
					}
					return api.showVerificationCodeDialog(componentProps) as Promise<RegisterResult>
				}
				if (isSignupAcceptableError(error)) {
					logger.interactionEnded(INTERACTIONS.CODE_SIGNUP)
				}

				throw error
			}
		},
		async sendForgotPasswordMail(email: string) {
			logger.interactionStarted(INTERACTIONS.RESET_PASSWORD)
			const userLanguage = language.userLanguage
			const encodedRequestUrl = encodeURIComponent(requestUrl)
			const encodedEmail = encodeURIComponent(email)
			await performFetch(sendResetPasswordEmailUrl, {
				method: 'POST',
				body: `returnUrl=${encodedRequestUrl}&collectionId=${smcollectionId}&metaSiteId=${metaSiteId}&lang=${userLanguage}&email=${encodedEmail}`,
			})

			logger.interactionEnded(INTERACTIONS.RESET_PASSWORD)
		},
		async sendSetPasswordEmail(email: string, options?: { hideIgnoreMessage?: boolean }): Promise<boolean> {
			const response = await performFetch(`${sendSetPasswordEmailUrl}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					authorization: metasiteInstance || '',
				},
				body: JSON.stringify({
					email,
					...(options?.hideIgnoreMessage ? { hideIgnoreMessage: options.hideIgnoreMessage } : {}),
				}),
			})

			return !!response?.accepted
		},
		async changePassword(newPassword: string, token: string) {
			const encodedNewPassword = encodeURIComponent(newPassword)
			await performFetch(changePasswordUrl, {
				method: 'POST',
				body: `newPassword=${encodedNewPassword}&forgotPasswordToken=${token}`,
			})
		},
		async resendEmailVerification(memberId: string) {
			await performFetch(`${resendEmailVerificationUrl}/${memberId}`)
		},
		async logout(redirectToUrl?: string) {
			if (!smToken) {
				return
			}

			// This might only become relevant again when running inside the editor
			// if (memberDetails && memberDetails.owner) {
			// 	// eslint-disable-next-line no-throw-literal
			// 	throw 'Current member is the site owner, which can not be logout'
			// }

			await performFetch(logoutUrl, {
				method: 'POST',
			}).catch(() => {
				reporter.trackEvent({
					eventName: 'CustomEvent',
					params: {
						eventCategory: 'Site members',
						eventAction: 'Log out failed',
					},
				})
			})

			await triggerCallbacks(onLogoutCallbacks)

			if (redirectToUrl) {
				const relativeUrl = `./${redirectToUrl.replace(/^\//, '')}`

				await router.navigate(relativeUrl)
			}

			if (!isSSR(browserWindow)) {
				browserWindow.document.location.reload()
			}
		},
		registerToUserLogin(
			callback: () => any,
			callbackId: string = uniqueId(
				'callback'
			) /* This specific prefix is added to maintain compat with previous implementation*/
		): string {
			onLoginCallbacks[callbackId] = callback
			return callbackId
		},
		unRegisterToUserLogin(callbackId: string): void {
			delete onLoginCallbacks[callbackId]
		},
		registerToMemberLogout(callback: () => any): string {
			const callbackId = uniqueId('logout_callback')
			onLogoutCallbacks[callbackId] = callback
			return callbackId
		},
		unRegisterToMemberLogout(callbackId: string): void {
			delete onLogoutCallbacks[callbackId]
		},
		registerToMemberDetailsRefresh(callback: () => any): string {
			const callbackId = uniqueId('mdrcb')
			onMemberDetailsRefresh[callbackId] = callback
			return callbackId
		},
		unRegisterToMemberDetailsRefresh(callbackId: string): void {
			delete onMemberDetailsRefresh[callbackId]
		},
		async showWelcomeDialog(isCloseable: boolean = true) {
			const props: CommonProps = {
				isCloseable,
			}

			const url = urlHistoryManager.getParsedUrl()
			const actions = {
				onCloseDialogCallback() {
					biEvents.closingDialog('WelcomeDialog')
					const urlHostname = new URL(viewerModel.requestUrl).hostname
					const hostName = urlHostname.indexOf('www') === 0 ? urlHostname.substr(3) : urlHostname
					clearCookie('sm_ef', '/', hostName)
					sm_efCookie = ''
					dialogService.hideDialog()
					router.navigate(url.href)
				},
				onSubmitCallback() {
					const urlHostname = new URL(viewerModel.requestUrl).hostname
					const hostName = urlHostname.indexOf('www') === 0 ? urlHostname.substr(3) : urlHostname
					clearCookie('sm_ef', '/', hostName)
					sm_efCookie = ''
					dialogService.hideDialog()
					if (isMemberInfoPage) {
						// FIXME: We should navigate to memberInfoPage somehow, not to this hardcoded url
						router.navigate('./account/my-account')
					}
					router.navigate(url.href)
				},
			}

			logger.interactionStarted(INTERACTIONS.WELCOME_DIALOG)
			logger.interactionEnded(INTERACTIONS.WELCOME_DIALOG)
			dialogService.displayDialog('WelcomeDialog', props, actions)
		},
		async showNoPermissionsToPageDialog(onCloseCallback?: () => any) {
			const actions = {
				onCloseDialogCallback() {
					dialogService.hideDialog()
					if (onCloseCallback) {
						onCloseCallback()
					}
				},
				onSwitchAccountLinkClick() {
					api.logout()
				},
			}

			dialogService.displayDialog('NoPermissionsToPageDialog', {}, actions)
		},
		async showResetPasswordDialog(token: string) {
			const props = {
				isCloseable: true,
				isTermsOfUseNeeded: !!(termsOfUse?.enabled && policyLinks.termsOfUse),
				isPrivacyPolicyNeeded: !!(privacyPolicy?.enabled && policyLinks.privacyPolicy),
				termsOfUseLink: policyLinks.termsOfUse,
				privacyPolicyLink: policyLinks.privacyPolicy,
				directionByLanguage: language.directionByLanguage,
			}

			const actions = {
				onCloseDialogCallback() {
					biEvents.closingDialog('ResetPasswordDialog')
					const url = urlHistoryManager.getParsedUrl()
					url.searchParams.delete('forgotPasswordToken')
					url.searchParams.delete('forgotPasswordLang')
					urlHistoryManager.pushUrlState(url)

					dialogService.hideDialog()
					router.navigate(url.href)
				},
				async onSubmitCallback(newPassword: string) {
					const translate = await translationsFetcher()
					try {
						await api.changePassword(newPassword, token)
						api.showNotificationDialog(
							translate(
								'siteMembersTranslations',
								'siteMembersTranslations_Reset_Password_Sucess_Title',
								'Your password has been changed.'
							),
							'',
							translate('siteMembersTranslations', 'SMContainer_OK', 'OK'),
							async () => {
								const url = urlHistoryManager.getParsedUrl()
								url.searchParams.delete('forgotPasswordToken')
								url.searchParams.delete('forgotPasswordLang')
								urlHistoryManager.pushUrlState(url)
								await api.showLoginDialog()
								router.navigate(url.href)
							}
						)
					} catch (errorCode) {
						if (errorCode !== -19972) {
							throw errorCode
						}
						api.showNotificationDialog(
							translate(
								'siteMembersTranslations',
								'siteMembersTranslations_PASSWORD_HAS_EXPIRED_TITLE',
								'Your link to create a new password has expired'
							),
							translate(
								'siteMembersTranslations',
								'siteMembersTranslations_PASSWORD_HAS_EXPIRED_TEXT',
								'To continue, resend a new link to your email.'
							),
							translate(
								'siteMembersTranslations',
								'siteMembersTranslations_PASSWORD_HAS_EXPIRED_OK',
								'Resend Link'
							),
							() =>
								api.promptForgotPassword(props.isCloseable).then(() => {
									const url = urlHistoryManager.getParsedUrl()
									router.navigate(url.href)
								})
						)
					}
				},
			}
			dialogService.displayDialog('ResetPasswordDialog', props, actions, getDialogOptions())
		},
		async showLoginDialog(
			isCloseable: boolean = true,
			displayMode: CommonProps['displayMode'] = 'fullscreen',
			returnPages: boolean = false
		): Promise<ExtendedLoginResult> {
			if (customSignInPageId && popups?.isPopupPage(customSignInPageId)) {
				return api.showCustomAuthenticationDialog(customSignInPageId, returnPages)
			}

			return new Promise(async (resolve, reject) => {
				smPopups.assignRequestAuthenticationPromise(resolve, reject)
				const props = {
					bsi,
					displayMode,
					language: language.userLanguage,
					directionByLanguage: language.directionByLanguage,
					isCloseable,
					smCollectionId: smcollectionId,
					svSession,
					biVisitorId: getBiVisitorId(),
					metaSiteId,
					isSocialLoginGoogleEnabled: socialLoginGoogleEnabled,
					isSocialLoginFacebookEnabled: !isSiteIsWixInternal && socialLoginFacebookEnabled,
					isEmailLoginEnabled: !isSiteIsWixInternal,
					shouldForceCaptchaVerification:
						experiments['specs.ShouldForceCaptchaVerificationOnLoginSpec'] === 'Enabled',
					isSocialAuthSupported,
					shouldUseInvisibleCaptcha: experiments['specs.thunderbolt.useInvisibleCaptcha'],
				}
				const actions = {
					onCloseDialogCallback() {
						dialogService.hideDialog()
						biEvents.closingDialog('MemberLoginDialog', displayMode)
						smPopups.rejectAuthenticationRequest()
					},
					submit(email: string, password: string, options?: ILoginOptions) {
						logger.interactionStarted(INTERACTIONS.DEFAULT_LOGIN)
						biEvents.emailAuthSubmitClicked('MemberLoginDialog', displayMode)
						return api
							.login(email, password, options, returnPages)
							.then((loginResult) => {
								logger.interactionEnded(INTERACTIONS.DEFAULT_LOGIN)
								dialogService.hideDialog()
								resolve(loginResult)
							})
							.catch((error) => {
								if (isLoginAcceptableError(error)) {
									logger.interactionEnded(INTERACTIONS.DEFAULT_LOGIN)
								}

								throw error
							})
					},
					onForgetYourPasswordClick() {
						api.promptForgotPassword(isCloseable)
					},
					onSwitchDialogLinkClick() {
						api.showSignUpDialog(isCloseable, displayMode, returnPages).then(resolve, () => {
							smPopups.rejectAuthenticationRequest()
						})
					},
					onTokenMessage(token: string, vendor: string, joinCommunityChecked: boolean = false) {
						let joinCommunityStatus
						if (isCommunityInstalled) {
							joinCommunityStatus = joinCommunityChecked ? 'PUBLIC' : 'PRIVATE'
						}
						return api
							.handleOauthToken(token, vendor, 'memberLoginDialog', joinCommunityStatus, returnPages)
							.then((loginResult) => {
								dialogService.hideDialog()
								resolve(loginResult)
							})
					},
					onBackendSocialLogin(
						data: {
							smSession: {
								sessionToken: string
								siteMemberDto: MemberDetailsDTO
							}
							siteMemberDto: MemberDetailsDTO
						},
						vendor: string
					) {
						return api.handleSocialLoginResponse(data, vendor, returnPages).then((loginResult) => {
							dialogService.hideDialog()
							resolve(loginResult)
						})
					},
					// Will be called by the component after mounting the social auth iframe to determine what to send inside via postMessage
					getHostReadyPayload: () => ({ visitorId: getBiVisitorId(), svSession }),
					openCaptcha: getOpenCaptcha({ captcha, userLanguage: language.userLanguage }),
				}
				biEvents.loginOrSignUpDialogLoaded('MemberLoginDialog', displayMode)
				await dialogService.displayDialog('MemberLoginDialog', props, actions, getDialogOptions())
				api.closeCustomAuthenticationDialogs(true)
			})
		},
		async showSignUpDialog(
			isCloseable: boolean = true,
			displayMode: CommonProps['displayMode'] = 'fullscreen',
			returnPages: boolean = false
		): Promise<ExtendedLoginResult> {
			if (customSignUpPageId && popups?.isPopupPage(customSignUpPageId)) {
				return api.showCustomAuthenticationDialog(customSignUpPageId, returnPages)
			}
			const shouldForceCaptchaVerification =
				experiments['specs.ShouldPassCaptchaVerificationOnSignupSpec'] !== 'Enabled' &&
				experiments['specs.ShouldForceCaptchaVerificationOnSignupSpec'] === 'Enabled'

			return new Promise(async (resolve, reject) => {
				smPopups.assignRequestAuthenticationPromise(resolve, reject)
				const props = {
					bsi,
					displayMode,
					language: language.userLanguage,
					directionByLanguage: language.directionByLanguage,
					isCloseable,
					smCollectionId: smcollectionId,
					biVisitorId: getBiVisitorId(),
					svSession,
					metaSiteId,
					isSocialLoginGoogleEnabled: socialLoginGoogleEnabled,
					isSocialLoginFacebookEnabled: !isSiteIsWixInternal && socialLoginFacebookEnabled,
					isSocialAuthSupported,
					isEmailLoginEnabled: !isSiteIsWixInternal,
					isCommunityInstalled,
					joinCommunityCheckedByDefault,
					isTermsOfUseNeeded: !!(termsOfUse?.enabled && policyLinks.termsOfUse),
					isPrivacyPolicyNeeded: !!(privacyPolicy?.enabled && policyLinks.privacyPolicy),
					isCodeOfConductNeeded: !!(codeOfConduct?.enabled && policyLinks.codeOfConduct),
					shouldUseInvisibleCaptcha: experiments['specs.thunderbolt.useInvisibleCaptcha'],
					shouldForceCaptchaVerification,

					termsOfUseLink: policyLinks.termsOfUse,
					privacyPolicyLink: policyLinks.privacyPolicy,
					codeOfConductLink: policyLinks.codeOfConduct,
				}
				const actions = {
					onCloseDialogCallback() {
						dialogService.hideDialog()
						biEvents.closingDialog('SignUpDialog', displayMode)
						smPopups.rejectAuthenticationRequest()
					},
					submit(email: string, password: string, options: ISignUpOptions | boolean) {
						// TODO: Since editor-elements will be GAing after the TB version we need to continue supporting
						// the 3rd attribute as `isCommunityChecked`, once we done we should remove it.
						let profilePrivacyStatus
						if (isCommunityInstalled) {
							const isCommunityChecked =
								typeof options === 'boolean' ? options : options.isCommunityChecked
							profilePrivacyStatus = isCommunityChecked ? PrivacyStatus.PUBLIC : PrivacyStatus.PRIVATE
						}
						const recaptchaToken = typeof options === 'boolean' ? undefined : options?.recaptchaToken
						const invisibleRecaptchaToken =
							typeof options === 'boolean' ? undefined : options?.invisibleRecaptchaToken
						logger.interactionStarted(INTERACTIONS.DEFAULT_SIGNUP)
						biEvents.emailAuthSubmitClicked('SignUpDialog', displayMode)
						return api
							.register(
								email,
								password,
								undefined,
								profilePrivacyStatus,
								undefined,
								returnPages,
								recaptchaToken,
								invisibleRecaptchaToken
							)
							.then((registerResult) => {
								logger.interactionEnded(INTERACTIONS.DEFAULT_SIGNUP)
								const { member, sessionToken, pages } = registerResult
								if (sessionToken) {
									dialogService.hideDialog()
									resolve({ member, sessionToken, ...(returnPages ? { pages } : {}) })
								}
							})
							.catch((error) => {
								if (isSignupAcceptableError(error)) {
									logger.interactionEnded(INTERACTIONS.DEFAULT_SIGNUP)
								}

								throw error
							})
					},
					onSwitchDialogLinkClick() {
						api.showLoginDialog(isCloseable, displayMode, returnPages).then(resolve, () => {
							smPopups.rejectAuthenticationRequest()
						})
					},
					onTokenMessage(token: string, vendor: string, joinCommunityChecked: boolean = false) {
						let joinCommunityStatus
						if (isCommunityInstalled) {
							joinCommunityStatus = joinCommunityChecked ? 'PUBLIC' : 'PRIVATE'
						}
						return api
							.handleOauthToken(token, vendor, 'memberLoginDialog', joinCommunityStatus, returnPages)
							.then((loginResult) => {
								dialogService.hideDialog()
								resolve(loginResult)
							})
					},
					onBackendSocialLogin(
						data: {
							smSession: {
								sessionToken: string
								siteMemberDto: MemberDetailsDTO
							}
							siteMemberDto: MemberDetailsDTO
						},
						vendor: string
					) {
						return api.handleSocialLoginResponse(data, vendor, returnPages).then((loginResult) => {
							dialogService.hideDialog()
							resolve(loginResult)
						})
					},
					// Will be called by the component after mounting the social auth iframe to determine what to send inside via postMessage
					getHostReadyPayload: () => ({ visitorId: getBiVisitorId(), svSession }),
					openCaptcha: getOpenCaptcha({ captcha, userLanguage: language.userLanguage }),
				}
				biEvents.loginOrSignUpDialogLoaded('SignUpDialog', displayMode)
				await dialogService.displayDialog('SignUpDialog', props, actions, getDialogOptions())
				api.closeCustomAuthenticationDialogs(true)
			})
		},
		async hideAuthDialog() {
			// This function is supported only for document service to allow hiding the dialog by the editor
			console.warn('hideAuthDialog is not supported')
		},
		async showNotificationDialog(
			title: string,
			description: string,
			okButtonText: string,
			onOkButtonClick: () => void = () => 0,
			onCloseDialogCallback: () => void = () => 0
		) {
			const props = {
				isCloseable: true,
				title,
				description,
				okButtonText,
			}
			const actions = {
				onCloseDialogCallback() {
					biEvents.closingDialog('NotificationDialog')
					dialogService.hideDialog()
					onCloseDialogCallback()
				},
				onOkButtonClick() {
					dialogService.hideDialog()
					onOkButtonClick()
				},
			}

			await dialogService.displayDialog('NotificationDialog', props, actions)
		},
		async showConfirmationEmailDialog(memberId: string, isSignUp = true) {
			if (experiments['specs.thunderbolt.rejectApprovalNeededAuthenticationRequests']) {
				return new Promise((_, reject) => {
					const props = {
						isCloseable: true,
						isSignUp,
					}
					const actions = {
						onCloseDialogCallback() {
							biEvents.closingDialog('ConfirmationEmailDialog')
							dialogService.hideDialog()
							// We must reject both, since we might get here by promptLogin() or by simply register()
							smPopups.rejectAuthenticationRequest()
							reject(AUTH_RESULT_REASON.CANCELED)
						},
						async onResendConfirmationEmail() {
							await api.resendEmailVerification(memberId)
							await api.showConfirmationEmailDialog(memberId, false).catch(reject)
						},
					}

					dialogService.displayDialog('ConfirmationEmailDialog', props, actions)
				})
			} else {
				const props = {
					isCloseable: true,
					isSignUp,
				}
				const actions = {
					onCloseDialogCallback() {
						biEvents.closingDialog('ConfirmationEmailDialog')
						dialogService.hideDialog()
					},
					async onResendConfirmationEmail() {
						await api.resendEmailVerification(memberId)
						await api.showConfirmationEmailDialog(memberId, false)
					},
				}

				return dialogService.displayDialog('ConfirmationEmailDialog', props, actions).then(hangingPromise)
			}
		},
		async showAdminApprovalDialog(email: string, type: 'signup' | 'login') {
			const translate = await translationsFetcher()
			if (experiments['specs.thunderbolt.rejectApprovalNeededAuthenticationRequests']) {
				return new Promise((_, reject) => {
					const cancel = () => {
						// We must reject both, since we might get here by promptLogin() or by simply register()
						smPopups.rejectAuthenticationRequest()
						reject(AUTH_RESULT_REASON.CANCELED)
					}
					api.showNotificationDialog(
						'',
						`${translate(
							'siteMembersTranslations',
							'SMApply_Success1',
							`Success! Your member ${type} request has been sent and is awaiting approval.`
						)} ${translate(
							'siteMembersTranslations',
							'SMApply_Success2',
							'The site administrator will notify you via email ({0}) once your request has been approved.'
						)}`.replace('{0}', email),
						translate('siteMembersTranslations', 'SMContainer_OK', 'OK'),
						cancel,
						cancel
					)
				})
			} else {
				return api
					.showNotificationDialog(
						'',
						`${translate(
							'siteMembersTranslations',
							'SMApply_Success1',
							`Success! Your member ${type} request has been sent and is awaiting approval.`
						)} ${translate(
							'siteMembersTranslations',
							'SMApply_Success2',
							'The site administrator will notify you via email ({0}) once your request has been approved.'
						)}`.replace('{0}', email),
						translate('siteMembersTranslations', 'SMContainer_OK', 'OK')
					)
					.then(hangingPromise)
			}
		},
		async showCustomAuthenticationDialog(
			pageId: string,
			returnPages: boolean = false
		): Promise<ExtendedLoginResult> {
			if (!popups) {
				throw new Error('popup unavailable')
			}

			return new Promise(async (resolve, reject) => {
				// In order to reject/resolve the original request for authentication we save the
				// rejection to a file scoped variable.
				smPopups.assignRequestAuthenticationPromise(resolve, reject)
				const cbid = api.registerToUserLogin(async () => {
					smPopups.resolveAuthenticationRequest({
						member: memberDetails,
						sessionToken: savedSessionToken,
						...(returnPages
							? {
									pages: await api.authorizeMemberPagesBySignedInstance(smToken),
							  }
							: {}),
					})
					api.unRegisterToUserLogin(cbid)
					if (popups.getCurrentPopupId() === pageId) {
						popups.closePopupPage()
					}
				}, 'customAuthCbId')
				await smPopups.openPopupPage(pageId, () => {
					api.unRegisterToUserLogin(cbid)
				})
				dialogService.hideDialog()
			})
		},
		async closeCustomAuthenticationDialogs(ignoreCallback = false) {
			const customPopupPageId = popups?.getCurrentPopupId()
			if (customPopupPageId && [customSignUpPageId, customSignInPageId].includes(customPopupPageId)) {
				if (ignoreCallback) {
					smPopups.preventCustomPopupCloseCallback()
				}
				await popups!.closePopupPage()
				smPopups.allowCustomPopupCloseCallback()
			}
		},
		getForgotPasswordToken() {
			const url = new URL(isSSR(browserWindow) ? viewerModel.requestUrl : location.href)
			return url.searchParams.get('forgotPasswordToken')
		},
		shouldDisplayWelcomeDialog() {
			return sm_efCookie && isMemberInfoPage
		},
		async showVerificationCodeDialog(verificationCodeProps: VerificationCodeProps) {
			const displayMode: CommonProps['displayMode'] = 'customPopup'
			return new Promise((resolve, reject) => {
				smPopups.assignRequestAuthenticationPromise(resolve, reject)
				const email = verificationCodeProps?.email
				const props = {
					language: language.userLanguage,
					directionByLanguage: language.directionByLanguage,
					isCloseable: smPopups.config?.isCloseable ?? true,
					displayMode,
					email,
				}
				const actions = {
					onResendVerificationCodeEmail() {
						return api.register(
							email,
							verificationCodeProps.password,
							verificationCodeProps.contactInfo,
							verificationCodeProps.profilePrivacyStatus,
							verificationCodeProps.defaultFlow,
							verificationCodeProps.returnPages,
							'',
							verificationCodeProps.invisibleRecaptchaToken,
							verificationCodeProps.emailVerification
						)
					},
					onCloseDialogCallback() {
						dialogService.hideDialog()
						biEvents.closingDialog('VerificationCode')
						smPopups.rejectAuthenticationRequest()
						reject(AUTH_RESULT_REASON.CANCELED)
					},
					onSubmitCallback(code: string) {
						const emailVerification: IEmailVerification = {
							verificationId: verificationCodeProps?.emailVerification?.verificationId || '',
							otp: code || '',
						}
						return api
							.register(
								email,
								verificationCodeProps.password,
								verificationCodeProps.contactInfo,
								verificationCodeProps.profilePrivacyStatus,
								verificationCodeProps.defaultFlow,
								verificationCodeProps.returnPages,
								'',
								verificationCodeProps.invisibleRecaptchaToken,
								emailVerification
							)
							.then((registerResult) => {
								logger.interactionEnded(INTERACTIONS.VERIFICATION_CODE)
								resolve(registerResult)
							})
							.catch((error) => {
								if (isSignupAcceptableError(error)) {
									logger.interactionEnded(INTERACTIONS.VERIFICATION_CODE)
								}
								reject(error)
							})
					},
				}

				dialogService.displayDialog('VerificationCodeDialog', props, actions)
			})
		},
		appWillMount() {
			const url = new URL(viewerModel.requestUrl)
			// Enable forcing dialogs for testing and debugging purposes
			switch (url.searchParams.get('showDialog')) {
				case 'MemberLoginDialog':
					api.showLoginDialog()
					break
				case 'SignUpDialog':
					api.showSignUpDialog()
					break
				case 'RequestPasswordResetDialog':
					api.promptForgotPassword()
					break
				case 'ResetPasswordDialog':
					api.showResetPasswordDialog('faketoken')
					break
				case 'WelcomeDialog':
					api.showWelcomeDialog()
					break
				case 'NoPermissionsToPageDialog':
					api.showNoPermissionsToPageDialog()
					break
				case 'NotificationDialog':
					api.showNotificationDialog('title', 'description', 'ok')
					break
				case 'ConfirmationEmailDialog':
					api.showConfirmationEmailDialog('fakemember')
					break
				case 'VerificationCodeDialog':
					api.showVerificationCodeDialog({
						email: 'testEmail@test.com',
						password: '',
						profilePrivacyStatus: 'PUBLIC' as PrivacyStatus,
						returnPages: false,
						defaultFlow: false,
						recaptchaToken: '',
						invisibleRecaptchaToken: 'false',
					})
					break
				default:
					break
			}
		},
		pageWillUnmount({ pageId }: { pageId: string }) {
			// We usually hide our dialogs on navigation. This lets us get out of the way in case
			// the visitor backs out of a protected page, navigates from the sign up dialog
			// to one of the policy pages, etc.
			// However, if we're using any custom forms, we mustn't treat their closure as a navigation
			// event, even though TB lifecycle does. This may lead to dialogs we intentionally opened
			// (eg. email approval dialog at the end of registration) being unintentionally closed.
			if (![customSignUpPageId, customSignInPageId].includes(pageId)) {
				dialogService.hideDialog()
			}
		},
		getSocialAuthComponentProps(): SocialAuthComponentProps {
			return _getSocialAuthComponentProps({
				config: siteFeatureConfig,
				viewerModel,
				sessionManager,
				bsiManager,
				handleOauthToken: api.handleOauthToken,
				handleSocialLoginResponse: api.handleSocialLoginResponse,
				isSocialAuthSupported: isCustomLoginSocialAuthSupported,
				captcha,
				userLanguage: language.userLanguage,
			})
		},
	}

	featureState.update(() => ({
		shouldShowRenderingBlockingDialogs: () => !!(api.getForgotPasswordToken() || api.shouldDisplayWelcomeDialog()),
		showRenderingBlockingDialogs: () => {
			const forgotPasswordToken = api.getForgotPasswordToken()

			// TODO: take care of the all the dialogs and behaviours that are triggered by
			// url, cookies, etc.
			if (forgotPasswordToken) {
				return api.showResetPasswordDialog(forgotPasswordToken)
			}
			if (api.shouldDisplayWelcomeDialog()) {
				return api.showWelcomeDialog()
			}
		},
	}))
	// TS incorrectly infers that the `applySessionToken` implementation above (which supports
	// an optional return type if an undocumented argument is applied) is incompatible with the
	// declared type.
	// This omit+union operation forces TS to accept `applySessionToken` as correct while still
	// typechecking the rest of the object.
	return api as Omit<typeof api, 'applySessionToken'> & { applySessionToken: ISiteMembersApi['applySessionToken'] }
}

const clearCookie = (cookieName: string, path: string, domain: string) => {
	document.cookie = `${cookieName}=;max-age=0`
	document.cookie = `${cookieName}=;max-age=0;path=${path}`
	document.cookie = `${cookieName}=;domain=${domain};max-age=0`
	document.cookie = `${cookieName}=;domain=${domain};max-age=0;path=${path}`
}

export const SiteMembersApi = withDependencies(
	[
		named(SiteFeatureConfigSymbol, name),
		named(MasterPageFeatureConfigSymbol, name),
		named(FeatureStateSymbol, name),
		Fetch,
		LoggerSymbol,
		ViewerModelSym,
		SessionManagerSymbol,
		Props,
		StructureAPI,
		LanguageSymbol,
		BrowserWindowSymbol,
		Router,
		SiteScrollBlockerSymbol,
		Translate,
		UrlHistoryManagerSymbol,
		BusinessLoggerSymbol,
		WixBiSessionSymbol,
		optional(PopupsSymbol),
		optional(ReporterSymbol),
		CurrentRouteInfoSymbol,
		ExperimentsSymbol,
		CaptchaApiSymbol,
		optional(BsiManagerSymbol),
	],
	siteMembersApi
)
