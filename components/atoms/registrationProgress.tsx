export default function RegistrationProgress({activeBar}: {activeBar?: number}):JSX.Element {
    const activeClassOne = activeBar === undefined ? " active" : ""
    const activeClassTwo = activeBar === 2 ? " active" : ""
    const activeClassThree = activeBar === 3 ? " active" : ""

    return <div className="registration_progress">
        <p className={"bar bar_1" + activeClassOne}></p>
        <p className={"bar bar_2" + activeClassTwo}></p>
        <p className={"bar bar_3" + activeClassThree}></p>
    </div>
}