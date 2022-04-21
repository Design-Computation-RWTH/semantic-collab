import React, { useEffect, useState } from "react";
import { Container } from "@mantine/core";
import RepresentationDetailsPlan from "./RepresentationPlan";
// @ts-ignore
import { Viewer } from "@xeokit/xeokit-sdk";

type RepresentaionDetailsProps = {
  selectedDocument: string;
  newFileName: string;
  file: string;
  viewer: Viewer;
};

//TODO: Set UI by representations type (ifc or png)
export default function Representationdetails(
  props: RepresentaionDetailsProps
) {
  return (
    <Container>
      <RepresentationDetailsPlan />
    </Container>
  );
}
