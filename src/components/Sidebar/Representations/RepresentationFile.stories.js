import React from "react";

import RepresentationFile from "./RepresentationFile"

export default {
    component: RepresentationFile,
    title: "Representation/RepresentationFile",
};

const Template = args => <RepresentationFile {...args} />

export const Default = Template.bind({})
Default.args = {
    document: {
        filename: "MyTestFilename",
        id: "MyRandomID",
        documentURL: "http://test.org",
        selected: true,
        spatialRepresentation: null,
    }
};
