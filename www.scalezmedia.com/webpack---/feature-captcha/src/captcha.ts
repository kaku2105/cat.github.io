import { withDependencies } from '@wix/thunderbolt-ioc'
import { IStructureAPI, StructureAPI, Props, IPropsStore, DIALOG_COMPONENT_ID } from '@wix/thunderbolt-symbols'
import { enableCyclicTabbing, disableCyclicTabbing } from '@wix/thunderbolt-commons'
import type { CaptchaDialogProps, ICaptchaApi } from './types'

/**
 * Exposing an access to open and close the captcha dialog component in a site level
 */
export const Captcha = withDependencies(
	[StructureAPI, Props],
	(structureApi: IStructureAPI, propsStore: IPropsStore): ICaptchaApi => {
		return {
			open(props: CaptchaDialogProps) {
				enableCyclicTabbing()
				propsStore.update({ [DIALOG_COMPONENT_ID]: props })
				structureApi.addComponentToDynamicStructure(DIALOG_COMPONENT_ID, {
					componentType: 'CaptchaDialog',
					components: [],
				})
			},
			close() {
				disableCyclicTabbing()
				structureApi.removeComponentFromDynamicStructure(DIALOG_COMPONENT_ID)
			},
		}
	}
)
