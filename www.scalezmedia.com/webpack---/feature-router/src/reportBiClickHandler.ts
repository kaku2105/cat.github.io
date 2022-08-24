import { withDependencies } from '@wix/thunderbolt-ioc'
import { BusinessLogger, BusinessLoggerSymbol, ILinkClickHandler } from '@wix/thunderbolt-symbols'

// eslint-disable-next-line no-restricted-syntax
import { isMailtoUrl, isPhoneUrl, isWhatsappLink } from '@wix/thunderbolt-commons/src/platform/linkPatternUtils'

export const ReportBiClickHandlerFactory = (businessLogger: BusinessLogger): ILinkClickHandler => {
	const sendBi = (clickType: string, value: string) => {
		businessLogger.logger.log(
			{
				src: 76,
				evid: 1112,
				clickType,
				value,
			},
			{ endpoint: 'pa' }
		)
	}
	return {
		handleClick: (anchorTarget: HTMLElement) => {
			const href = anchorTarget.getAttribute('href') || ''

			if (isPhoneUrl(href)) {
				sendBi('phone-clicked', href)
			}
			if (isMailtoUrl(href)) {
				sendBi('email-clicked', href)
			}
			if (isWhatsappLink(href)) {
				sendBi('whatsapp-clicked', href)
			}
			return false
		},
	}
}

export const ReportBiClickHandler = withDependencies([BusinessLoggerSymbol], ReportBiClickHandlerFactory)
