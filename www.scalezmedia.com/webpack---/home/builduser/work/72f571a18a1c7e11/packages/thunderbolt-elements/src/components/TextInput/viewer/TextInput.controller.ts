import type { IComponentController } from '@wix/editor-elements-types/thunderbolt';
import { ITextInputControllerActions } from '../TextInput.types';

const mapActionsToProps: IComponentController = ({
  updateProps,
}): ITextInputControllerActions => ({
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
