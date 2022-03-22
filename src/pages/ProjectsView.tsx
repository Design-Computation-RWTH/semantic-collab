import React, {useEffect} from "react";
import {useState} from "react";
import { SimpleGrid, Button, Center} from '@mantine/core';
import BCFAPIService from "../services/BCFApIService";
// @ts-ignore
import PubSub from 'pubsub-js'
import ProjectElement from "../components/Projects/ProjectElement";
import {useNavigate} from "react-router-dom";
import AddProjectsModal from "../components/Modals/AddProjectsModal";


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




type ProjectListViewProps = {
    history:any;  // Is it needeed?
};


function ProjectListView(props: ProjectListViewProps) {
     const [projects, setProjects] = useState<any[]>([]);


    useEffect(() => {
        PubSub.publish('ProjectName', {name: null})
        PubSub.publish('CloseMenu',"");
        update();
    }, [])

    function update() {
        let bcfapi=new BCFAPIService();
        bcfapi.getProjects()
            .then(value => {
                console.log("projects read")
                setProjects(value );
            })
            .catch(err => {
                console.log(err)
        });
    }

    let binx=1000;
    return (
        <div>
            <Center p={"md"}>
                <SimpleGrid cols={4} >
                    {projects.map((d) =>
                        <ProjectElement
                            project={{projectName: d.name, projectId: d.project_id}}
                            key={String(binx++)}
                            keyvalue={String(binx)}
                            //keyvalue={String(binx++)}
                            //TODO: What is this history for?
                            history={props.history}/>)}
                </SimpleGrid>
            </Center>
            <AddProjectsModal/>
            <div className="main-refresh">
                <Button onClick={() => {
                    console.log("RefreshTest")
                    update()
                }
                }> Refresh </Button>
            </div>

        </div>
    );

}

export default withRouter(ProjectListView);