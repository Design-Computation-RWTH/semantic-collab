import React from "react";
import BcfOWLProjectSetup from "../../services/BcfOWLProjectSetup";
import PubSub from "pubsub-js";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

type GenericDeleteFormProps = {
  onHide(): any;
  show: boolean;
  item: string;
  bcfOWLProperty: string;
  deleteValue: string;
};

function GenericDeleteForm(props: GenericDeleteFormProps) {
  const execute = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    let bcfowl_setup = new BcfOWLProjectSetup();
    bcfowl_setup
      .removePropertyValue(
        props.bcfOWLProperty.trim(),
        props.deleteValue.trim()
      )
      .then(() => {
        PubSub.publish("Update", {
          txt:
            "Deleted " +
            props.bcfOWLProperty.trim() +
            " - " +
            props.deleteValue.trim(),
        });
        PubSub.publish("SetupUpdate", "Update view.");
      });
    props.onHide();
  };

  return (
    <Modal {...props} aria-labelledby="contained-modal-title-vcenter">
      <Modal.Header closeButton>
        <Modal.Title>Confirm deletion</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        Remove the {props.item} from the project. {props.bcfOWLProperty}
        <br /> Selected value is: <b>{props.deleteValue}</b>
      </Modal.Body>

      <Modal.Footer>
        <Button onClick={props.onHide}>Cancel</Button>
        <Button onClick={execute} variant="primary">
          Remove selected
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default GenericDeleteForm;
