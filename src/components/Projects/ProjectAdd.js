import PropTypes from 'prop-types';
import React from "react";
import Button from "react-bootstrap/Button";
import PubSub from "pubsub-js";
import {ReactSession} from "react-client-session";
import {Accordion, Card, useAccordionButton} from "react-bootstrap";
import Form from "react-bootstrap/Form";
import {FaPlus} from "react-icons/fa";



export default function ProjectAdd({project: {projectName, projectId}, keyvalue, isOpen, projectList}) {

    function handleClick(e) {
        ReactSession.set("projectid", e.target.value);
    }

    function CustomToggle({OnClick, children, eventKey }) {
        const decoratedOnClick = useAccordionButton(eventKey, () => {
                isOpen = !isOpen;
                if(isOpen)
                    OnClick("Cancel");
                else
                    OnClick("Add a project");
            }
        );
        if(!isOpen)
            return (
                <Button onClick={decoratedOnClick} variant="light">
                    <FaPlus/>
                    {children}
                </Button>
            )
        else
            return (
                <div/>
            )
    }

    function CustomInternalToggle({OnClick, children, eventKey }) {
        const decoratedOnClick = useAccordionButton(eventKey, () => {
                isOpen = !isOpen;
                OnClick("Add a project");
            }
        );
        return (
            <Button onClick={decoratedOnClick} variant="outline-dark">
                {children}
            </Button>
        )
    }

    function submitted(event) {
        event.preventDefault();
        this.bcfowl_setup.addProject(this.state.new_project_name).then(
            () =>{
                //Target location:
                PubSub.publish('Update', {txt: "Project created. Name: "+this.state.new_project_name});
                projectList.update();
            }
        )
    };

    function handleValue(event) {
        projectList.setState({
            new_project_name: event.target.value,
        });
    };


    return (
        <Accordion>
            <Card>
                <Card.Header>
                    <CustomToggle OnClick={() => {}} eventKey="0">Add new Project</CustomToggle>
                </Card.Header>
                <Accordion.Collapse eventKey="0">
                    <Card.Body>
                        <Form onSubmit={submitted}>
                            <Form.Group className="mb-3" controlId="formProjectName">
                                <Form.Label>Enter Text{/*this.props.item*/}</Form.Label>
                                <Form.Control type="text" onChange={handleValue} placeholder="Enter project name"/>
                            </Form.Group>
                            <CustomInternalToggle OnClick={txt=> this.setState({add_button_text: txt})} eventKey="0">Enter Another Project</CustomInternalToggle>
                            <Button variant="outline-dark" type="submit">
                                Add
                            </Button>
                        </Form>
                    </Card.Body>
                </Accordion.Collapse>
            </Card>
        </Accordion>
    )
}

ProjectAdd.propTypes = {
    project: PropTypes.shape ( {
        projectName: PropTypes.string,
        projectId: PropTypes.string,
    }),
    keyvalue: PropTypes.string,
    history: PropTypes.array,
}