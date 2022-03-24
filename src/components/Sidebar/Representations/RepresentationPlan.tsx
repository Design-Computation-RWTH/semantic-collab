import React, {useEffect, useRef, useState} from "react";
import {Container, SimpleGrid, Text, Group, NumberInput, Divider, Button, Title, Center} from "@mantine/core";
import {ViewerContext} from "../../../context/dcwebviewerContext";
import { useNotifications } from '@mantine/notifications';
import {DcWebViewerContextType} from "../../../@types/dcwebviewer";
import BcfOWLService from "../../../services/BcfOWLService";
import wkt from "terraformer-wkt-parser";
import { useInputState } from '@mantine/hooks';
import PubSub from "pubsub-js";

type PlanProps = {

}

export default function RepresentationDetailsPlan(props: PlanProps)
{
    const notifications = useNotifications();

    const {selectedDocument, setSelectedDocument} = React.useContext(ViewerContext) as DcWebViewerContextType;

    const [xValue, setXValue] = useInputState(0);
    const [yValue, setYValue] = useInputState(0);
    const [zValue, setZValue] = useInputState(0);

    const [rotation, setRotation] = useInputState(0);

    const [scale, setScale] = useInputState(0);
    const [measuredDistance, setMeasuredDistance] = useInputState(0);
    const [targetDistance, setTargetDistance] = useInputState(0)

    let un_subsel = PubSub.subscribe("MeasurementSet", subMeasurementSet);

    let bcfowl = new BcfOWLService();

    useEffect(() => {
        init()
        console.log("init")
        return () => {
            PubSub.unsubscribe(un_subsel)
        }
    },[])


    function init() {
        if (selectedDocument.name !== "new_temp_plan") {
            bcfowl.describe(selectedDocument.spatial_representation).then((spatial) => {

                // Setting the Transform in the Inputs
                let tempLocation = wkt.parse(spatial.hasLocation) as any;
                setXValue(tempLocation.coordinates[0]);
                setYValue(tempLocation.coordinates[1]);
                setZValue(tempLocation.coordinates[2]);

                let tempRotation = wkt.parse(spatial.hasRotation) as any;
                setRotation(tempRotation.coordinates[2])

                let tempScale = wkt.parse(spatial.hasScale) as any;
                setScale(tempScale.coordinates[0]);

            })
        }
    }

    useEffect(() => {
        //TODO: Enter code for moving plan here

        PubSub.publish("DocumentMoved", {
            id: selectedDocument.id,
            position: [xValue/10, zValue/10, yValue/10 ],
        });

    }, [xValue, yValue, zValue])

    useEffect(() => {
        //TODO: Enter code for moving plan here

    }, [scale])

    useEffect(() => {
        //TODO: Enter code for moving plan here

        PubSub.publish("DocumentRotated", {
            id: selectedDocument.id,
            rotation: [0,0,rotation],
        });

    }, [rotation])

    function handleMeasureDistance () {
        PubSub.publish("SetClickMode", {
            clickMode: "MeasureOnce",
        });
    }

    function subMeasurementSet(msg: any, data: any) {
        setMeasuredDistance(Math.round((data.length + Number.EPSILON) * 100) / 100)
    }

    function handleSetDistance() {
        if (targetDistance > 0) {
            let distance = targetDistance / measuredDistance
            PubSub.publish("DocumentMeasuredScale", {
                id: selectedDocument.id,
                value: distance,
            });
            setScale(distance * scale)
        } else {
            notifications.showNotification({
                title: 'Set Target Distance',
                message: 'Please set your Target Distance first',
            })
        }
    }



    return (
        <Container>
            <Title order={4}>{selectedDocument.name}</Title>
            <SimpleGrid spacing="xs">
                <div>
                    <Divider my="xs" size="xl" label="Location" />
                    <Group spacing="xs">
                        <div>
                            <Text>X</Text>
                            <NumberInput    stepHoldDelay={500}
                                            precision={2}
                                            stepHoldInterval={100}
                                            value={xValue}
                                            defaultValue={xValue}
                                            id={"NumberInputX"}
                                            onChange={setXValue}
                            />
                        </div>
                        <div>
                            <Text>Y</Text>
                            <NumberInput stepHoldDelay={500}
                                         precision={2}
                                         stepHoldInterval={100}
                                         value={yValue}
                                         onChange={setYValue}/>
                        </div>
                        <div>
                            <Text>Z</Text>
                            <NumberInput stepHoldDelay={500}
                                         precision={2}
                                         stepHoldInterval={100}
                                         value={zValue}
                                         onChange={setZValue}/>
                        </div>

                    </Group>
                </div>
                <div>
                    <Divider my="xs" size="xl" label="Rotation" />
                    <Group spacing="xs">
                        <NumberInput stepHoldDelay={500}
                                     precision={2}
                                     stepHoldInterval={100}
                                     value={rotation}
                                     onChange={setRotation}/>
                    </Group>
                </div>
                <div>
                    <Divider my="xs" size="xl" label="Scale" />
                    <Group spacing="xs">
                        <NumberInput stepHoldDelay={500}
                                     precision={2}
                                     stepHoldInterval={100}
                                     disabled
                                     value={scale}
                                     onChange={setScale}/>
                        <NumberInput stepHoldDelay={500}
                                     precision={2}
                                     label={"Measured Distance"}
                                     disabled={true}
                                     stepHoldInterval={100}
                                     value={measuredDistance}/>
                        <NumberInput stepHoldDelay={500}
                                     precision={2}
                                     label={"Target Distance"}
                                     stepHoldInterval={100}
                                     value={targetDistance}
                                     onChange={setTargetDistance}/>
                    </Group>
                </div>
                <Center>
                    <Group>
                        <Button onClick={handleMeasureDistance} compact>Measure Distance</Button>
                        <Button onClick={handleSetDistance} compact>Set Distance</Button>
                        <Button compact>Update/Upload</Button>
                    </Group>
                </Center>
            </SimpleGrid>
        </Container>
    )

}
