import React, {useState} from "react";
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


function AddUserForm(props: AddUserFormProps)  {
    const [value, setValue] = useState("");
    let bcfowl: BcfOWLService =new BcfOWLService();
    let bcfowl_setup: BcfOWLProjectSetup =new BcfOWLProjectSetup();


    const handleValue = (event: { target: { value: any; }; }) => {
        setValue(event.target.value);
    };

    const submitted = (event: { preventDefault: () => void; }) => {
        event.preventDefault();
        props.onHide();
        bcfowl.getUserByEmail(value.trim())
            .then(user=> {
                if (user["@id"]) {
                    bcfowl_setup.insertUser(user["@id"]).then(e=>
                        {
                            PubSub.publish('Update', {txt: "User " + value + " added."});
                            PubSub.publish('SetupUpdate', "Update view.");
                        }
                    )
                } else
                    PubSub.publish('Update', {txt: "User " + value + " does not exist. Contact admin."});
            })
            .catch(err => {
                console.log(err)
            });

    };


    return <Modal {...props} aria-labelledby="contained-modal-title-vcenter">
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    Add user to the project
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="show-grid">
                <Form onSubmit={submitted}>
                    <Form.Group className="mb-3" controlId="formProjectName">
                        <Form.Label>Users e-mail address</Form.Label>
                        <Form.Control type="email" onChange={handleValue} placeholder="Enter users email address"/>
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
                <Button onClick={props.onHide}>Close</Button>
            </Modal.Footer>
    </Modal>;
}

export default AddUserForm;
