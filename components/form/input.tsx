import { InputAttributes, InputEvents, InputOptions, InputTypes } from "../../types/input";
import styles from "../../styles/sass/modules/input.module.scss"
import conversationStyles from "../../styles/sass/modules/conversations.module.scss"
import { ChangeEventHandler } from "react";

function Input({type, attributes, events}: InputOptions<InputTypes[number]>): JSX.Element {
    return (
      <input
        type={type ? type : "text"}
        className={attributes.className}
        name={attributes.name}
        id={attributes.id}
        checked={type === "checkbox" || type === "radio" ? attributes.checked : undefined}
        placeholder={attributes.placeholder}
        onChange={events?.onChange}
        value={attributes.value !== null ? attributes.value : ""}
      />
    );
}

function InputRadio({label, attributes, events}: {
    label?: string, attributes:InputAttributes<"radio">,
    events?: InputEvents<"radio">
}): JSX.Element {
    console.log(events)
    return <div className={"form_group form_group_" + attributes.className}>
        <Input type="radio" attributes={attributes} events={events}/>
        {label && <label htmlFor={attributes.id}>{label}</label>}
    </div>
}

function InputText({label, attributes, events, errors}: {
    label?: string, 
    attributes: InputAttributes<"text">,
    events?: InputEvents<"text">, 
    errors?: string | null
}): JSX.Element {
    
    return <div className={"form_group form_group_" + attributes.className}>
        {label && <label htmlFor={attributes.id}>{label}</label>}
        <Input type="text" attributes={attributes} events={events}/>
        {errors !== null && errors !== undefined && <small className={styles.error}>{errors}</small>}
    </div>
}

function InputPassword({label, attributes, events,errors}: {
    label?: string, attributes: InputAttributes<"password">,
    events?: InputEvents<"password">, errors?: string | null
}): JSX.Element {
    return <div className={"form_group form_group_" + attributes.className}>
        {label && <label htmlFor={attributes.id}>{label}</label>}
        <Input type="password" attributes={attributes} events={events}/>
        {errors !== null && errors !== undefined && <small className={styles.error}>{errors}</small>}
    </div>
}

function InputCheckbox({label, attributes, events}: {
    label?: string, attributes: InputAttributes<"checkbox">,
    events?: InputEvents<"checkbox">
}): JSX.Element {
    return <div className={"form_group form_group_" + attributes.className}>
        {label && <label htmlFor={attributes.id} className={styles.label_for_checkbox}>{label}</label>}
        <Input type="checkbox" attributes={attributes} events={events}/>
    </div>
}

function InputNumber({label, attributes, events}: {
    label?: string, attributes: InputAttributes<"number">,
    events?: InputEvents<"number">
}): JSX.Element {
    return <div className={"form_group form_group_" + attributes.className}>
        {label && <label htmlFor={attributes.id}>{label}</label>}
        <Input type="number" attributes={attributes} events={events}/>
    </div>
}

function InputEmail({label, attributes, events}: {
    label?: string, attributes: InputAttributes<"email">,
    events?: InputEvents<"email">
}): JSX.Element {
    return <div className={"form_group form_group_" + attributes.className}>
        {label && <label htmlFor={attributes.id}>{label}</label>}
        <Input type="email" attributes={attributes} events={events}/>
    </div>
}

function InputHidden({attributes}:{attributes: InputAttributes<"hidden">}):JSX.Element {
    return <Input type="hidden" attributes={attributes}/>
}

function InputSearch({attributes, events}:{
    attributes: InputAttributes<"search">,
    events?: InputEvents<"search">
}): JSX.Element {
    return <Input type="search" attributes={attributes} events={events}/>
}

function AddReceiverInput({onChangeInput}: {
    onChangeInput: ChangeEventHandler<HTMLInputElement>
}): JSX.Element {
    return <InputSearch events={{onChange: onChangeInput}} attributes={{
        className: `search_input ${conversationStyles.add_receiver}`, 
        placeholder: "A : "}}/>
}

export {
  InputText,
  InputNumber,
  InputRadio,
  InputCheckbox,
  InputPassword,
  InputEmail,
  InputHidden,
  InputSearch,
  AddReceiverInput
};
