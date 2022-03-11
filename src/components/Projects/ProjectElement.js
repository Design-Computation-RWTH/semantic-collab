import PropTypes from 'prop-types';
import React from "react";
import Button from "react-bootstrap/Button";
import PubSub from "pubsub-js";
import {ReactSession} from "react-client-session";
import {useNavigate} from "react-router-dom";



export default function ProjectElement({project: {projectName, projectId}, keyvalue, history}) {

    const navigate = useNavigate()

    function handleClick(e) {
        ReactSession.set("projectid", e.target.value);
    }
    return (
        <Button
            className='btn-project mt-1 '
            variant="btn btn-primary"
            value={projectId}
            key={String(keyvalue)}
            onClick={e=>{
                handleClick(e);
                PubSub.publish('ProjectName', {name: projectName});
                PubSub.publish('SidebarName', {name: projectName});
                navigate(projectName + '/');
                //history.push('projects/' + projectName + '/overview');
                }}
        >
            {projectName}
        </Button>
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