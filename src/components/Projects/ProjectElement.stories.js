import React from "react";

import ProjectElement from "./ProjectElement";

export default {
  component: ProjectElement,
  title: "ProjectView/ProjectElement",
};

const Template = (args) => <ProjectElement {...args} />;

export const Default = Template.bind({});
Default.args = {
  project: {
    projectName: "Test Project",
    projectId: "RandomGUID",
  },
};
