import React from "react";
import BcfOWLProjectSetup from "../../services/BcfOWLProjectSetup";
import PubSub from "pubsub-js";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

type DeleteUserFormProps = {
  onHide(): any;
  show: boolean;
  item: string;
  deleteValue: string;
};

function DeleteUserForm(props: DeleteUserFormProps) {
  const execute = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    let bcfowl_setup = new BcfOWLProjectSetup();
    bcfowl_setup.deletetUser(props.deleteValue.trim()).then(() => {
      PubSub.publish("Update", { txt: "Deleted user " + props.item });
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
        Remove user <b>{props.item}</b> from the project.
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

export default DeleteUserForm;
