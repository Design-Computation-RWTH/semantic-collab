import React from "react";


import BasicButton from "./BasicButton";

export default {
    component: BasicButton,
    title: "Basics/BasicButton",
};

const Template = args => <BasicButton {...args} />

export const Default = Template.bind({})
Default.args = {
    title: "Test Button",
}