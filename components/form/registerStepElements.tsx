import { PrimaryButtonWithArrowRight, SecondaryButton } from "../widgets/button";
import ProfilePhotoChoiceInput from "../widgets/profilePhotoChoiceInput";
import RegistrationProgress from "../widgets/registrationProgress";
import { InputEmail, InputPassword, InputRadio, InputText } from "./input";
import { ElementEvents } from "../../types/events";
import { UserIdentity } from "../../types/user";
import { RegistrationFormErrors } from "../../types/registration/registrationFormErrors";
import styles from "../../styles/sass/modules/input.module.scss"
import { UserUniqueProperties } from "../../types/user";


function RegisterStepOne({inputsEvents, values, errors}: {
  inputsEvents: ElementEvents<HTMLInputElement>,
  values: UserIdentity,
  errors: RegistrationFormErrors
}):JSX.Element {
  
  return (
    <div className="register_step_one">
      <div className="inline_block_inputs">
        <InputText
          attributes={{
            className: "name_input",
            name: "name",
            value: values.name,
            placeholder: "Nom",
          }}
          events={inputsEvents}
        />
        <InputText
          attributes={{
            className: "firstname_input",
            name: "firstname",
            value: values.firstname,
            placeholder: "Prénom",
          }}
          events={inputsEvents}
        />
        {errors.name !== undefined ? <small className={styles.error + " " + styles.nameError}>{errors.name[0]}</small> : null}
        {errors.firstname !== undefined ? <small className={styles.error + " " + styles.firstnameError}>{errors.firstname[0]}</small> : null}
      </div>
      <InputText
        attributes={{
          className: "username_input",
          name: "username",
          value: values.username,
          placeholder: "Pseudo",
        }}
        events={inputsEvents} errors={errors.username !== undefined ? errors.username : null}
      />
      <InputRadio
        label="Homme"
        attributes={{
          className: "man_radio_button",
          name: "sex",
          checked: values.sex === "man",
          value: "man"
        }}
        events={inputsEvents}
      />
      <InputRadio
        label="Femme"
        attributes={{
          className: "woman_radio_button",
          name: "sex",
          checked: values.sex === "woman",
          value: "woman"
        }}
        events={inputsEvents}
      />

      <PrimaryButtonWithArrowRight>Suivant </PrimaryButtonWithArrowRight>
      <RegistrationProgress />
    </div>
  );
}

function RegisterStepTwo({inputsEvents, values}: {
  inputsEvents: ElementEvents<HTMLInputElement>,
  values: UserUniqueProperties
}): JSX.Element {
  return (
    <div className="register_step_two">
      <InputEmail
        attributes={{
          className: "email_input",
          name: "email",
          value: values.email,
          placeholder: "Adresse mail",
        }}
        events={{
          onChange: inputsEvents.onChange
        }}
      />
      <InputPassword
        attributes={{
          className: "password_input",
          name: "password",
          value: values.password,
          placeholder: "Mot de passe"
        }}
        events={{
          onChange: inputsEvents.onChange
        }}
      />
      <InputPassword
        attributes={{
          className: "password_confirmation_input",
          name: "password_confirmation",
          value: values.passwordConfirmation,
          placeholder: "Confirmer le mot de passe"
        }}
        events={{
          onChange: inputsEvents.onChange
        }}
      />

      <PrimaryButtonWithArrowRight>Suivant </PrimaryButtonWithArrowRight>
      <RegistrationProgress activeBar={2} />
    </div>
  );
}

function RegisterStepThree({events}: {events: ElementEvents<HTMLDivElement>}): JSX.Element {
  return (
    <div className="register_step_three">
      <ProfilePhotoChoiceInput />
      <SecondaryButton>Ignorer </SecondaryButton>
      <RegistrationProgress activeBar={3} />
    </div>
  );
}

export { RegisterStepOne, RegisterStepTwo, RegisterStepThree}