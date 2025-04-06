import { PrimaryButton, PrimaryButtonWithArrowRight, SecondaryButton } from "@/components/atoms/button";
import ProfilePhotoChoiceInput from "@/components/atoms/profilePhotoChoiceInput";
import RegistrationProgress from "@/components/atoms/registrationProgress";
import { InputEmail, InputPassword, InputRadio, InputText } from "@/components/atoms/input";
import { ElementEvents } from "@/types/events";
import { UserIdentity } from "@/types/user";
import styles from "@/styles/sass/modules/input.module.scss"
import { UserUniqueProperties } from "@/types/user";
import { ButtonContext } from "@/components/contexts/ButtonContext";
import { RegistrationFormErrors } from "@/types/errors";
import { Portal } from "@/components/templates/Portal";
import { ProgressBar } from "@/components/atoms/loaders/Progressbar";
import { useContext } from "react";
import { ProgressContext } from "@/components//contexts/Progress";


function RegisterStepOne({inputsEvents, values, errors, disableButton}: {
  inputsEvents: ElementEvents<HTMLInputElement>,
  values: UserIdentity,
  errors: RegistrationFormErrors,
  disableButton: boolean
}):JSX.Element {
  
  const progress = useContext(ProgressContext)
  
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
        {errors.name !== undefined ? <small className={styles.error + " " + styles.nameError}>{errors.name}</small> : null}
        {errors.firstname !== undefined ? <small className={styles.error + " " + styles.firstnameError}>{errors.firstname}</small> : null}
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
      
      <PrimaryButtonWithArrowRight disabled={disableButton}>Suivant </PrimaryButtonWithArrowRight>
      <RegistrationProgress />
        
      <Portal>
            <ProgressBar progress={progress}/>
        </Portal>
    </div>
  );
}

function RegisterStepTwo({inputsEvents, values, disableButton, passConfirmationError, invalidPassError, errors}: {
  inputsEvents: ElementEvents<HTMLInputElement>,
  values: UserUniqueProperties,
  disableButton: boolean,
  passConfirmationError: string|null,
  invalidPassError: string|null,
  errors: RegistrationFormErrors,
}): JSX.Element {

  const progress = useContext(ProgressContext)

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
      {errors.email !== undefined ? <small className={styles.error + " " + styles.nameError}>{errors.email}</small> : null}
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
        errors={invalidPassError}
      />
      <InputPassword
        attributes={{
          className: "password_confirmation_input",
          name: "password_confirmation",
          value: values.password_confirmation,
          placeholder: "Confirmer le mot de passe"
        }}
        events={{
          onChange: inputsEvents.onChange
        }}
        errors={passConfirmationError}
      />
      <PrimaryButtonWithArrowRight disabled={disableButton}>Suivant </PrimaryButtonWithArrowRight>
      <RegistrationProgress activeBar={2} />

      <Portal>
            <ProgressBar progress={progress}/>
        </Portal>
    </div>
  );
}

function RegisterStepThree({
  events, 
  activeButton,
  chosenProfilePhoto
}: {
  events: ElementEvents<HTMLDivElement>,
  activeButton: 'ignore' | 'finish',
  chosenProfilePhoto: File | null
}): JSX.Element {
  
  const progress = useContext(ProgressContext)

  return (
    <div className="register_step_three">
      <ProfilePhotoChoiceInput image={chosenProfilePhoto} onClickImagePicker={events.onClick !== undefined ? events.onClick : null}/>
      { activeButton === "ignore" ? 
        <SecondaryButton>Ignorer </SecondaryButton> :
        <PrimaryButton>Terminer</PrimaryButton>
      }
      <RegistrationProgress activeBar={3} />

      <Portal>
            <ProgressBar progress={progress}/>
        </Portal>
    </div>
  );
}

export { RegisterStepOne, RegisterStepTwo, RegisterStepThree, ButtonContext }