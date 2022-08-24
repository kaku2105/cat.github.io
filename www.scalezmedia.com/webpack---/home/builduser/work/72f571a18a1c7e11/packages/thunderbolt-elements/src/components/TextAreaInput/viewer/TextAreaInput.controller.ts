import type { IComponentController } from '@wix/editor-elements-types/thunderbolt';
import { ITextAreaInputControllerActions } from '../TextAreaInput.types';

const mapActionsToProps: IComponentController = ({
  updateProps,
}): ITextAreaInputControllerActions => ({
  onValueChange: value => {
    updateProps({
      value,
    });
  },
  setValidityIndication: (shouldShowValidityIndication: boolean) => {
    updateProps({
      shouldShowValidityIndication,
    });
  },
});

export default mapActionsToProps;
