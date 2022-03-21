import React from "react";
import { SimpleGrid, Button, Center } from '@mantine/core';
import Form from "react-bootstrap/Form";
import BCFAPIService from "../services/BCFApIService";
// @ts-ignore
import PubSub from 'pubsub-js'
import {FaPlus} from "react-icons/fa";
import {Accordion, Card, useAccordionButton} from "react-bootstrap";
import BcfOWLProjectSetup from "../services/BcfOWLProjectSetup";
import BasicButton from "../components/Basics/BasicButton";
import ProjectElement from "../components/Projects/ProjectElement";
import {useNavigate} from "react-router-dom";

let isOpen=false;

type ToggleClickAction ={
    OnClick:any;
    children:any;
    eventKey:any;
};

export const withRouter = (Component: any) => {
    const Wrapper = (props: any) => {
        const navigate = useNavigate();

        return (
            <Component
                navigate={navigate}
                {...props}
            />
        );
    };

    return Wrapper;
};

function CustomToggle({OnClick, children, eventKey }:ToggleClickAction) {
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

function CustomInternalToggle({OnClick, children, eventKey }:ToggleClickAction) {
    const decoratedOnClick = useAccordionButton(eventKey, () => {
             isOpen = !isOpen;
             OnClick("Add a project");
        }
    );
        return (
            <Button onClick={decoratedOnClick} >
                {children}
            </Button>
        )
}

let projectListView_instance:ProjectListView;
type ProjectListViewProps = {
    history:any;  // Is it needeed?
};

type ProjectListViewState = {
    new_project_name: string | null,
    projects: any[],
    add_button_text: string,
};

class ProjectListView extends React.Component<ProjectListViewProps,ProjectListViewState> {
    private bcfowl_setup: BcfOWLProjectSetup;

    constructor(props: ProjectListViewProps | Readonly<ProjectListViewProps>) {
        super(props);
        projectListView_instance=this;
        //Target location:
        PubSub.publish('ProjectName', {name: null})
        this.state = {
            new_project_name: null,
            projects: [],
            add_button_text: "Add new project",
        };
        this.bcfowl_setup=new BcfOWLProjectSetup();
        //Target location:
        PubSub.publish('CloseMenu',"");
    }

    handleValue = (event: { target: { value: any; }; }) => {
        this.setState({
            new_project_name: event.target.value,
        });
    };


    submitted = (event:any) => {
        event.preventDefault();
        this.bcfowl_setup.addProject(this.state.new_project_name).then(
            () =>{
                //Target location:
               PubSub.publish('Update', {txt: "Project created. Name: "+this.state.new_project_name});
               projectListView_instance.update();
           }
        )
    };

    render() {
        let binx=1000;
        return (
            <div>
                <Center p={"md"}>
                    <SimpleGrid cols={4} >
                        {this.state.projects.map((d) =>
                            <ProjectElement
                                project={{projectName: d.name, projectId: d.project_id}}
                                key={String(binx++)}
                                keyvalue={String(binx)}
                                //keyvalue={String(binx++)}
                                //TODO: What is this history for?
                                history={this.props.history}/>)}
                    </SimpleGrid>
                </Center>

                <Accordion>
                    <Card>
                        <Card.Header>
                            <CustomToggle OnClick={(txt:string)=> this.setState({add_button_text: txt})} eventKey="0"> Add Project</CustomToggle>
                        </Card.Header>
                        <Accordion.Collapse eventKey="0">
                            <Card.Body>
                                <Form onSubmit={this.submitted}>
                                    <Form.Group className="mb-3" controlId="formProjectName">
                                        <Form.Control type="text" onChange={this.handleValue} placeholder="Enter project name"/>
                                    </Form.Group>
                                    <CustomInternalToggle OnClick={(txt:string)=> this.setState({add_button_text: txt})} eventKey="0"> Cancel</CustomInternalToggle>
                                    <Button type="submit">
                                        Add
                                    </Button>
                                </Form>
                            </Card.Body>
                        </Accordion.Collapse>
                    </Card>
                </Accordion>
                <div className="main-refresh">
                    <Button onClick={() => {
                                console.log("RefreshTest")
                            this.update()
                            }
                    }> Refresh </Button>
                </div>

            </div>
        );
    }

    componentDidMount() {
        this.update();
    }

    componentWillUnmount() {

    }

    update() {
        let bcfapi=new BCFAPIService();
        bcfapi.getProjects()
            .then(value => {
                console.log("projects read")
                this.setState({ projects: value });
            })
            .catch(err => {
                console.log(err)
        });
        this.forceUpdate();
    }
}

export default withRouter(ProjectListView);