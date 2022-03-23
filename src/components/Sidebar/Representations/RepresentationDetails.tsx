import React, {useEffect, useState} from "react";
import {Container} from "@mantine/core";
import RepresentationDetailsPlan from "./RepresentationPlan";
// @ts-ignore
import { Viewer } from "@xeokit/xeokit-sdk";

let RepresentationDetails_instance = null;
let Viewer_instance = null;
// let documenttable_component = null;
// const base_uri = "https://caia.herokuapp.com";

// Set the scale for the documents movement /10 is equal to cm
const scale = 10;

type RepresentaionDetailsProps = {
    selectedDocument: string;
    newFileName: string;
    file: string;
    viewer: Viewer
};



//let documenttable_component=null;
export default function Representationdetails(props: RepresentaionDetailsProps)
{
  const [spatialURI, setSpatialURI] = useState("");
  const [data, setData] = useState([]) as any;
  const [location, setLocation] = useState([0,0,0]) as any;
  const [rotation, setRotation] = useState([0,0,0]) as any;
  const [scale, setScale] = useState([1,1,1]) as any;
  const [storeys, setStoreys] = useState([]);
  const [alignment, setAlignment] = useState("center");
  const [documentCaia, setDocument] = useState(null) as any;
  const [name, setName] = useState("") as any;

  return (
      <Container>
        <RepresentationDetailsPlan/>
      </Container>
  )

}

