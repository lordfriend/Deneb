import {ControlGroup} from "@angular/common";


export function passwordMatch(passwordKey:string, passwordConfirmKey:string) {
  return (group:ControlGroup):{[key:string]:any} => {
    let password = group.controls[passwordKey];
    let passwordConfirm = group.controls[passwordConfirmKey];
    return password.value !== passwordConfirm.value ? {mismatchedPasswords: true}: null;
  };
}
