import {useForm} from "@mantine/form";
import {Box, Button, Group, Modal, Textarea, TextInput} from "@mantine/core";
import React, {useState} from "react";
import {BsPlusLg} from "react-icons/bs"
import { useModals } from '@mantine/modals';
import BcfOWLProjectSetup from "../../services/BcfOWLProjectSetup";
import PubSub from 'pubsub-js';


export default function AddProjectsModal() {
    const [opened, setOpened] = useState(false);
    const modals = useModals();

    const form = useForm({
        initialValues: {
            Name: "",
            Description: "",
        },

    });

    return (
        <>
            <Modal
                opened={opened}
                onClose={() => setOpened(false)}
                title="Create new Project"
                id="ProjectAddModal"
            >
                <Box sx={{ maxWidth: 300 }} mx="auto">
                    <form onSubmit={form.onSubmit((values) => {
                        let bcfowl_setup = new BcfOWLProjectSetup();

                        bcfowl_setup.addProject(values.Name).then(
                            () => {
                                //Target location:
                                PubSub.publish('Update', {txt: "Project created. Name: " + values.Name});
                                console.log("Close??")
                                modals.closeModal("ProjectAddModal");
                            }
                        )
                    })
                    }>
                        <TextInput
                            required
                            label="Project Name"
                            placeholder="Project Name"
                            {...form.getInputProps('Name')}
                        />
                        <Textarea
                            label="Project Description"
                            placeholder="Enter description"
                            {...form.getInputProps("Description")}
                        />

                        <Group position="right" mt="md">
                            <Button type="submit">Add project</Button>
                        </Group>
                    </form>
                </Box>

            </Modal>

            <Group position="center">
                <p>
                    <Button onClick={() => setOpened(true)}><BsPlusLg width={20} height={20}/></Button>
                </p>
            </Group>
        </>
    );
}