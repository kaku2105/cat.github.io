import TextInputComponent from '@wix/thunderbolt-elements/src/components/TextInput/viewer/TextInput';
import TextInputController from '@wix/thunderbolt-elements/src/components/TextInput/viewer/TextInput.controller';


const TextInput = {
  component: TextInputComponent,
  controller: TextInputController
};


export const components = {
  ['TextInput']: TextInput
};


// temporary export
export const version = "1.0.0"
