import React from "react";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
// @ts-ignore
import PubSub from "pubsub-js";
import BcfOWLService from "../../services/BcfOWLService";
import BcfOWLProjectSetup from "../../services/BcfOWLProjectSetup";

type AddUserFormProps = {
    onHide(): any;
    show:boolean;
};

type AddUserFormState = {
    value?: any;
};


class AddUserForm extends React.Component<AddUserFormProps, AddUserFormState> {
    private bcfowl: BcfOWLService;
    private bcfowl_setup: BcfOWLProjectSetup;

    state: AddUserFormState = {
    };

    constructor(props: AddUserFormProps | Readonly<AddUserFormProps>) {
        super(props);
        this.bcfowl=new BcfOWLService();
        this.bcfowl_setup=new BcfOWLProjectSetup();

    }

    handleValue = (event: { target: { value: any; }; }) => {
        this.setState({
            value: event.target.value,
        });
    };

    submitted = (event: { preventDefault: () => void; }) => {
        event.preventDefault();
        this.props.onHide();
        this.bcfowl.getUserByEmail(this.state.value.trim())
            .then(user=> {
                if (user["@id"]) {
                    this.bcfowl_setup.insertUser(user["@id"]).then(e=>
                        {
                            PubSub.publish('Update', {txt: "User " + this.state.value + " added."});
                            PubSub.publish('SetupUpdate', "Update view.");
                        }
                    )
                } else
                    PubSub.publish('Update', {txt: "User " + this.state.value + " does not exist. Contact admin."});
            })
            .catch(err => {
                console.log(err)
            });;

    };


    render() {
        return <Modal {...this.props} aria-labelledby="contained-modal-title-vcenter">
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    Add user to the project
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="show-grid">
                <Form onSubmit={this.submitted}>
                    <Form.Group className="mb-3" controlId="formProjectName">
                        <Form.Label>Users e-mail address</Form.Label>
                        <Form.Control type="email" onChange={this.handleValue} placeholder="Enter users email address"/>
                        <Form.Text className="text-muted">
                            The e-mail address of an existing user at the system.
                        </Form.Text>
                    </Form.Group>
                    <Button variant="outline-dark" type="submit">
                        Add
                    </Button>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={this.props.onHide}>Close</Button>
            </Modal.Footer>
        </Modal>;
    }
}

export default AddUserForm;
