import React from "react";
import BcfOWLProjectSetup from "../../services/BcfOWLProjectSetup";
// @ts-ignore
import PubSub from "pubsub-js";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

type GenericDeleteFormProps = {
    onHide(): any;
    show:boolean;
    item: string;
    bcfOWLProperty:string;
    deleteValue:string;
};

type GenericDeleteFormState = {
    value?: any;
};


class GenericDeleteForm extends React.Component<GenericDeleteFormProps, GenericDeleteFormState>  {
    private bcfowl_setup: any;

    state: GenericDeleteFormState = {
    };

    constructor(props: GenericDeleteFormProps | Readonly<GenericDeleteFormProps>) {
        super(props);
        this.bcfowl_setup=new BcfOWLProjectSetup();

    }

    execute = (event: { preventDefault: () => void; }) => {
        event.preventDefault();
        console.log("Delete values prop: "+this.props.bcfOWLProperty);
        console.log("Delete values val: "+this.props.deleteValue);
        this.bcfowl_setup.removePropertyValue(this.props.bcfOWLProperty.trim(),this.props.deleteValue.trim()).then(()=> {
            PubSub.publish('Update', {txt: "Deleted " + this.props.bcfOWLProperty.trim() + " - " + this.props.deleteValue.trim()});
            PubSub.publish('SetupUpdate', "Update view.");
        }
       );
        this.props.onHide();

    };

    render() {
        return (
            <Modal {...this.props} aria-labelledby="contained-modal-title-vcenter">
                <Modal.Header closeButton>
                    <Modal.Title>Confirm deletion</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    Remove the {this.props.item} from the project. {this.props.bcfOWLProperty}
                    <br/>    Selected value is: <b>{this.props.deleteValue}</b>
                </Modal.Body>

                <Modal.Footer>
                    <Button onClick={this.props.onHide}>Cancel</Button>
                    <Button onClick={this.execute} variant="primary">Remove selected</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

export default GenericDeleteForm;
