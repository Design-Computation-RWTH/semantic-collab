import React from "react";
import BcfOWLProjectSetup from "../../services/BcfOWLProjectSetup";
// @ts-ignore
import PubSub from "pubsub-js";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

type DeleteUserFormProps = {
    onHide(): any;
    show:boolean;
    item: string;
    deleteValue:string;
};

type DeleteUserFormState = {
};


class DeleteUserForm extends React.Component<DeleteUserFormProps, DeleteUserFormState> {
    private bcfowl_setup: any;

    constructor(props: DeleteUserFormProps | Readonly<DeleteUserFormProps>) {
        super(props);
        this.bcfowl_setup=new BcfOWLProjectSetup();

    }


    execute = (event: { preventDefault: () => void; }) => {
        event.preventDefault();
        console.log("Delete values val: "+this.props.deleteValue);
        this.bcfowl_setup.deletetUser(this.props.deleteValue.trim()).then(()=> {
            PubSub.publish('Update', {txt: "Deleted user " +  this.props.item});
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
                    Remove user  <b>{this.props.item}</b> from the project.
                </Modal.Body>

                <Modal.Footer>
                    <Button onClick={this.props.onHide}>Cancel</Button>
                    <Button onClick={this.execute} variant="primary">Remove selected</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

export default DeleteUserForm;
