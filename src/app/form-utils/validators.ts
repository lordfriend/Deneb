import {FormGroup} from "@angular/forms";


export function passwordMatch(passwordKey:string, passwordConfirmKey:string) {
  return (group:FormGroup):{[key:string]:any} => {
    let password = group.get(passwordKey);
    let passwordConfirm = group.get(passwordConfirmKey);
    return password.value !== passwordConfirm.value ? {mismatchedPasswords: true}: null;
  };
}
