import React, { useState } from "react";
import BcfOWLProjectSetup from "../../services/BcfOWLProjectSetup";
import PubSub from "pubsub-js";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import BcfOWLService from "../../services/BcfOWLService";

type GenericAddFormProps = {
  onHide(): any;
  show: boolean;
  item: string;
  bcfOWLProperty: string;
};

function GenericAddForm(props: GenericAddFormProps) {
  const [value, setValue] = useState("");

  const handleValue = (event: { target: { value: any } }) => {
    setValue(event.target.value);
  };

  const submitted = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    let bcfowl_setup: BcfOWLProjectSetup = new BcfOWLProjectSetup();
    bcfowl_setup.insertPropertyValue(props.bcfOWLProperty.trim(), value.trim());
    props.onHide();
    PubSub.publish("Update", {
      txt: "Inserted " + props.bcfOWLProperty.trim() + " - " + value.trim(),
    });
    PubSub.publish("SetupUpdate", "Update view.");
  };

  return (
    <Modal {...props} aria-labelledby="contained-modal-title-vcenter">
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Add new {props.item} to the project.
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="show-grid">
        <Form onSubmit={submitted}>
          <Form.Group className="mb-3" controlId="formProjectName">
            <Form.Control
              type="text"
              onChange={handleValue}
              placeholder={"Enter new " + props.item + " value "}
            />
          </Form.Group>
          <Button variant="outline-dark" type="submit">
            Add
          </Button>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default GenericAddForm;
