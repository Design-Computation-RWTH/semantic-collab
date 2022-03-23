import React from "react";

import NavBrand from "./NavBrand";

export default {
  component: NavBrand,
  title: "Navigation/Navbar",
};

const Template = (args) => <NavBrand {...args} />;

export const Default = Template.bind({});
Default.args = {
  project: {
    projectName: "Test Project",
    projectId: "RandomGUID",
  },
  user: "Oliver Schulz",
};

export const NoProject = Template.bind({});
NoProject.args = {
  project: {
    projectName: null,
    projectId: null,
  },
  user: "Oliver Schulz",
};

export const NoUser = Template.bind({});
NoUser.args = {
  project: {
    projectName: null,
    projectId: null,
  },
  user: null,
};
