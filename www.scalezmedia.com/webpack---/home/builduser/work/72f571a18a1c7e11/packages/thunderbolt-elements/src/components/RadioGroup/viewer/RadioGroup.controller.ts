import type { IComponentController } from '@wix/editor-elements-types/thunderbolt';

const mapActionsToProps: IComponentController = ({ updateProps }) => ({
  setValidityIndication: (shouldShowValidityIndication: boolean) => {
    updateProps({
      shouldShowValidityIndication,
    });
  },
  setValue: (value: string) => {
    updateProps({
      value,
    });
  },
});

export default mapActionsToProps;
