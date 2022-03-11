import React from "react";
import BcfOWLProjectSetup from "../../services/BcfOWLProjectSetup";
// @ts-ignore
import PubSub from "pubsub-js";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

type GenericAddFormProps = {
    onHide(): any;
    show:boolean;
    item: string;
    bcfOWLProperty:string;
};

type GenericAddFormState = {
    value?: any;
};

class GenericAddForm extends React.Component<GenericAddFormProps, GenericAddFormState>  {
    private bcfowl_setup: BcfOWLProjectSetup;
    state: GenericAddFormState = {
    };

    constructor(props: GenericAddFormProps | Readonly<GenericAddFormProps>) {
        super(props);
        this.bcfowl_setup=new BcfOWLProjectSetup();

    }

    handleValue = (event: { target: { value: any; }; }) => {
        this.setState({
            value: event.target.value,
        });
    };


    submitted = (event: { preventDefault: () => void; }) => {
        event.preventDefault();
        this.bcfowl_setup.insertPropertyValue(this.props.bcfOWLProperty.trim(),this.state.value.trim());
        this.props.onHide();
        PubSub.publish('Update', {txt: "Inserted "+this.props.bcfOWLProperty.trim() +" - "+ this.state.value.trim()});
        PubSub.publish('SetupUpdate', "Update view.");
    };


    render() {
        return (
            <Modal {...this.props} aria-labelledby="contained-modal-title-vcenter">
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Add new {this.props.item} to the project.
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="show-grid">
                    <Form onSubmit={this.submitted}>
                        <Form.Group className="mb-3" controlId="formProjectName">
                            <Form.Control type="text" onChange={this.handleValue} placeholder={"Enter new "+this.props.item+" value "}/>
                        </Form.Group>
                        <Button variant="outline-dark" type="submit">
                            Add
                        </Button>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.props.onHide}>Close</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

export default GenericAddForm;
