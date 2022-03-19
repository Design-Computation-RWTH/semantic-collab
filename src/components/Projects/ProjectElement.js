import PropTypes from 'prop-types';
import React from "react";
import { Card, Image, Text, Badge, Button, Group, useMantineTheme } from '@mantine/core';
import PubSub from "pubsub-js";
import {ReactSession} from "react-client-session";
import {useNavigate} from "react-router-dom";



export default function ProjectElement({project: {projectName, projectId}, keyvalue, history}) {

    const navigate = useNavigate()

    function handleClick() {
        ReactSession.set("projectid", projectId);
        PubSub.publish('ProjectName', {name: projectName});
        PubSub.publish('SidebarName', {name: projectName});
        navigate(projectName + '/');
    }
    return (
        <div style={{ width: 340, margin: 'auto' }}>
            <Card withBorder={true} color={"blue"} shadow="sm" p="md">
                <Card.Section>

                </Card.Section>

                <Group position="apart" style={{ marginBottom: 5, /*marginTop: theme.spacing.sm*/ }}>
                    <Text weight={700}>{projectName}</Text>
                </Group>

                <Text size="sm" style={{ lineHeight: 1.5 }}>
                    lorem ipsum dolor sit
                </Text>
                <Button
                    value={projectId}
                    key={String(keyvalue)}
                    onClick={handleClick}
                >
                    Open {projectName}
                </Button>
            </Card>
        </div>

)
}

ProjectElement.propTypes = {
    project: PropTypes.shape ( {
        projectName: PropTypes.string,
        projectId: PropTypes.string,
    }),
    keyvalue: PropTypes.string,
    history: PropTypes.array,
}