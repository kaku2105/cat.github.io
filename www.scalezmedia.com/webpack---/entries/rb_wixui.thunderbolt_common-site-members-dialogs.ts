import MemberLoginDialogComponent from '@wix/thunderbolt-elements/src/components/MemberLoginDialog/viewer/MemberLoginDialog';
import MemberLoginDialogController from '@wix/thunderbolt-elements/src/components/MemberLoginDialog/viewer/MemberLoginDialog.controller';
import RequestPasswordResetDialogComponent from '@wix/thunderbolt-elements/src/components/RequestPasswordResetDialog/viewer/RequestPasswordResetDialog';
import SignUpDialogComponent from '@wix/thunderbolt-elements/src/components/SignUpDialog/viewer/SignUpDialog';
import SignUpDialogController from '@wix/thunderbolt-elements/src/components/SignUpDialog/viewer/SignUpDialog.controller';


const MemberLoginDialog = {
  component: MemberLoginDialogComponent,
  controller: MemberLoginDialogController
};

const RequestPasswordResetDialog = {
  component: RequestPasswordResetDialogComponent
};

const SignUpDialog = {
  component: SignUpDialogComponent,
  controller: SignUpDialogController
};


export const components = {
  ['MemberLoginDialog']: MemberLoginDialog,
  ['RequestPasswordResetDialog']: RequestPasswordResetDialog,
  ['SignUpDialog']: SignUpDialog
};


// temporary export
export const version = "1.0.0"
