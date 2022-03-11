import Container from "react-bootstrap/Container";
import React from "react";


import XeoKitView from "../components/Viewport/XeoKitView";

type ViewportProps = {

};

type ViewportState = {
    viewpoints: any[],
    large_image_uri: string,
    active_topic: any,
    screen: number,
    Offcanvas: boolean,
};

class Viewport extends React.Component<ViewportProps,ViewportState> {
    constructor(props: ViewportProps | Readonly<ViewportProps>) {
        super(props);

        this.state = {
            viewpoints: [],
            large_image_uri: "Icon_v2.svg",
            active_topic: null,
            screen: 0,
            Offcanvas:true,
        };
    }

    render() {
        {

            // Modeel View
            return (
                <div>
                    <Container fluid>
                        <XeoKitView className="viewport"></XeoKitView>
                    </Container>
                    <Container>
                        <div className="sidebar"></div>
                    </Container>
                </div>
            );

        }
    }



    componentDidMount() {

    }
}

export default Viewport;