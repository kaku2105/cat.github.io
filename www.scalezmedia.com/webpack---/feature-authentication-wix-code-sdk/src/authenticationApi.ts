import { withDependencies } from '@wix/thunderbolt-ioc'
import { getOpenCaptcha, getWithCaptchaChallengeHandler, ICaptchaDialog, ICaptchaApi } from '@wix/thunderbolt-commons'
import { ILanguage, LanguageSymbol, ExperimentsSymbol, Experiments, CaptchaApiSymbol } from '@wix/thunderbolt-symbols'

export const AuthenticationApi = withDependencies(
	[CaptchaApiSymbol, LanguageSymbol, ExperimentsSymbol],
	(captcha: ICaptchaApi, language: ILanguage, experiments: Experiments): ICaptchaDialog => {
		const openCaptchaDialog = getOpenCaptcha({ captcha, userLanguage: language.userLanguage })
		const api: ICaptchaDialog = {
			openCaptchaDialog,
			withCaptchaChallengeHandler: getWithCaptchaChallengeHandler({ experiments, openCaptchaDialog }),
		}
		return api
	}
)
