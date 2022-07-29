import React, { useEffect, useRef, useState } from "react";
import { Button, Checkbox, Container, Group, Modal, Stack, Text } from "@mantine/core";
import RepresentationDetailsPlan from "./RepresentationPlan";
// @ts-ignore
import { Viewer } from "@xeokit/xeokit-sdk";
import BcfOWL_Endpoint from "../../../services/BcfOWL_Endpoint";
import { ViewerContext } from "../../../context/dcwebviewerContext";
import { DcWebViewerContextType } from "../../../@types/dcwebviewer";

type RepresentaionDetailsProps = {
  selectedDocument: string;
  newFileName: string;
  file: string;
  viewer: Viewer;
};

export default function Representationdetails(
  props: RepresentaionDetailsProps
) {
  const [opened, setOpened] = useState(false);
  const [error, setError] = useState<string>(" ");
  const ref = useRef<HTMLInputElement>(null);

  const {setRepresentationScreen} = React.useContext(
    ViewerContext
  ) as DcWebViewerContextType;

  function deleteFile() {
    if (ref.current?.checked){
      let destroyModel = props.viewer.scene.models[props.selectedDocument]
      destroyModel.destroy();
      setError("");
      setRepresentationScreen(0)
      let bcfowl = new BcfOWL_Endpoint();
      bcfowl.deleteDocument(props.selectedDocument)

    } else {
      setError("Please confirm deletion");
    }
  }

  return (
    <Container>
      <Modal
        opened={opened}
        onClose={()=>setOpened(false)}
        title="Delete Representation?">

          <Stack>
            <Text>Do you really want to delete the Representation?</Text>
            <Checkbox.Group error={error}>
            <Checkbox
              ref={ref}
              value="delete"
              label="Yes I'm sure"
            /></Checkbox.Group>
            <Group>
              <Button onClick={deleteFile}>Delete</Button>
              <Button onClick={() => setOpened(false)}>Cancel</Button>
            </Group>
          </Stack>

      </Modal>
      <Button onClick={() => setOpened(true)} radius="md" size="xs" >
        Delete Representation
      </Button>
      <RepresentationDetailsPlan />

    </Container>
  );
}
