import React from "react";
import Form from "react-bootstrap/Form";
import { Tooltip, ScrollArea, Text } from "@mantine/core";
import Button from "react-bootstrap/Button";
import ListGroup from "react-bootstrap/ListGroup";
import Card from "react-bootstrap/Card";

// @ts-ignore
import PubSub from "pubsub-js";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { FaPlus } from "react-icons/fa";
import { FaMinus } from "react-icons/fa";

import BcfOWLProjectSetup from "../services/BcfOWLProjectSetup";
import BcfOWL_Endpoint from "../services/BcfOWL_Endpoint";

import GenericAddForm from "../components/Setup/GenericAddForm";
import AddUserForm from "../components/Setup/AddUserForm";
import GenericDeleteForm from "../components/Setup/GenericDeleteForm";
import DeleteUserForm from "../components/Setup/DeleteUserForm";

type SetupViewProps = {};

type SetupViewState = {
  addUserScreen: boolean;
  deleteUserScreen: boolean;

  genericAddScreen_labels: boolean;
  genericAddScreen_priorities: boolean;
  genericAddScreen_documentationPhase: boolean;
  genericAddScreen_topicStatus: boolean;
  genericAddScreen_topicType: boolean;

  genericDeleteScreen_labels: boolean;
  genericDeleteScreen_priorities: boolean;
  genericDeleteScreen_documentationPhase: boolean;
  genericDeleteScreen_topicStatus: boolean;
  genericDeleteScreen_topicType: boolean;

  extensionsMap: any;

  currentItem: string;
  projectName: string;
  projectUsers: any[];
  topicTypes: any[];
  topicStatuses: any[];
  documentationPhases: any[];
  priorities: any[];
  labels: any[];

  selectedDeleteValue?: any;
  genericDeleteScreen_topicType_item?: any;
  genericDeleteScreen_topicStatus_item?: any;
  genericDeleteScreen_documentationPhase_item?: any;
  genericDeleteScreen_priorities_item?: any;
  genericDeleteScreen_labels_item?: any;
};

let setupView_instance: any;

class SetupView extends React.Component<SetupViewProps, SetupViewState> {
  private bcfowl_setup: BcfOWLProjectSetup;
  private readonly subNotificationstoken: any;
  private bcfowl: BcfOWL_Endpoint;

  state: SetupViewState = {
    addUserScreen: false,
    deleteUserScreen: false,

    genericAddScreen_labels: false,
    genericAddScreen_priorities: false,
    genericAddScreen_documentationPhase: false,
    genericAddScreen_topicStatus: false,
    genericAddScreen_topicType: false,

    genericDeleteScreen_labels: false,
    genericDeleteScreen_priorities: false,
    genericDeleteScreen_documentationPhase: false,
    genericDeleteScreen_topicStatus: false,
    genericDeleteScreen_topicType: false,

    extensionsMap: {},

    currentItem: "",
    projectName: "",
    projectUsers: [],
    topicTypes: [],
    topicStatuses: [],
    documentationPhases: [],
    priorities: [],
    labels: [],
  };

  constructor(props: SetupViewProps | Readonly<SetupViewProps>) {
    super(props);
    setupView_instance = this;
    this.bcfowl_setup = new BcfOWLProjectSetup();
    this.bcfowl = new BcfOWL_Endpoint();

    this.subNotificationstoken = PubSub.subscribe(
      "SetupUpdate",
      this.subUpdates
    );
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.subNotificationstoken);
  }

  handleName = (event: { target: { value: any } }) => {
    this.setState({
      projectName: event.target.value,
    });
  };

  submitted = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    PubSub.publish("ProjectName", { name: this.state.projectName });
    this.bcfowl_setup.setCurrentProjectName(this.state.projectName);
  };

  subUpdates(msg: any, data: any) {
    setupView_instance.update();
  }

  render() {
    const users_list = this.state.projectUsers.map((user) => {
      if (user.mbox.length > 7)
        return (
          <ListGroup.Item key={user + "_user"}>
            <Container>
              <Row>
                <Col xs={11}>
                  {user.name},<br />
                  {user.mbox.slice(7)}{" "}
                </Col>
                <Col xs={1}>
                  <Button
                    variant="light"
                    onClick={() => {
                      this.setState({ selectedDeleteValue: user["@id"] });
                      this.setState({ deleteUserScreen: true });
                      this.setState({ currentItem: user.mbox.slice(7) });
                    }}
                  >
                    <FaMinus />
                  </Button>
                </Col>
              </Row>
            </Container>
          </ListGroup.Item>
        );
      else
        return (
          <ListGroup.Item key={user + "_user"}>
            <Container>
              <Row>
                <Col xs={11}>
                  {user.name},<br />
                  {user.mbox}{" "}
                </Col>
                <Col xs={1}>
                  <Button
                    variant="light"
                    onClick={() => {
                      this.setState({ selectedDeleteValue: user["@id"] });
                      this.setState({ deleteUserScreen: true });
                      this.setState({ currentItem: user.mbox });
                    }}
                  >
                    <FaMinus />
                  </Button>
                </Col>
              </Row>
            </Container>
          </ListGroup.Item>
        );
    });

    //TODO: When creating tasks make sure that there are comments for the extensions!
    const topictype_list = this.state.topicTypes.map((topictype) => {
      if (this.state.extensionsMap[topictype] !== undefined) {
        if (
          this.state.extensionsMap[topictype].comment &&
          this.state.extensionsMap[topictype].label
        ) {
          return (
            <ListGroup.Item key={topictype + "_TopicType"}>
              <Container>
                <Row>
                  <Col xs={11}>
                    <Tooltip
                      multiline
                      width={220}
                      withArrow
                      transition="fade"
                      transitionDuration={200}
                      label={this.state.extensionsMap[topictype].comment}
                    >
                      <Text>{this.state.extensionsMap[topictype].label}</Text>
                    </Tooltip>
                  </Col>
                  <Col xs={1}>
                    <Button
                      variant="light"
                      onClick={() => {
                        this.setState({ genericDeleteScreen_topicType: true });
                        this.setState({
                          genericDeleteScreen_topicType_item: topictype,
                        });
                      }}
                    >
                      <FaMinus />
                    </Button>
                    <GenericDeleteForm
                      show={this.state.genericDeleteScreen_topicType}
                      item="topic type"
                      deleteValue={
                        this.state.genericDeleteScreen_topicType_item
                      }
                      bcfOWLProperty="hasTopicType"
                      onHide={() =>
                        this.setState({ genericDeleteScreen_topicType: false })
                      }
                    />
                  </Col>
                </Row>
              </Container>
            </ListGroup.Item>
          );
        }
      } else {return (<></>)}
    });

    const topicstatus_list = this.state.topicStatuses.map((topicstatus) => {
      if (this.state.extensionsMap[topicstatus] !== undefined) {
        if (
          this.state.extensionsMap[topicstatus].comment &&
          this.state.extensionsMap[topicstatus].label
        ) {
          return (
            <ListGroup.Item key={topicstatus + "_TopiStatus"}>
              <Container>
                <Row>
                  <Col xs={11}>
                    <Tooltip
                      multiline
                      width={220}
                      withArrow
                      transition="fade"
                      transitionDuration={200}
                      label={this.state.extensionsMap[topicstatus].comment}
                    >
                      <Text>
                      {this.state.extensionsMap[topicstatus].label}</Text>
                    </Tooltip>
                  </Col>
                  <Col xs={1}>
                    <Button
                      variant="light"
                      onClick={() => {
                        this.setState({
                          genericDeleteScreen_topicStatus: true,
                        });
                        this.setState({
                          genericDeleteScreen_topicStatus_item: topicstatus,
                        });
                      }}
                    >
                      <FaMinus />
                    </Button>
                    <GenericDeleteForm
                      show={this.state.genericDeleteScreen_topicStatus}
                      item="topic status"
                      deleteValue={
                        this.state.genericDeleteScreen_topicStatus_item
                      }
                      bcfOWLProperty="hasTopicStatus"
                      onHide={() =>
                        this.setState({
                          genericDeleteScreen_topicStatus: false,
                        })
                      }
                    />
                  </Col>
                </Row>
              </Container>
            </ListGroup.Item>
          );
        }
      } else {return (<></>)}
    });

    const documentationphase_list = this.state.documentationPhases.map(
      (documentationPhase) => {
        if (this.state.extensionsMap[documentationPhase] !== undefined) {
          if (
            this.state.extensionsMap[documentationPhase].comment &&
            this.state.extensionsMap[documentationPhase].label
          ) {
            return (
              <ListGroup.Item key={documentationPhase + "_documentationPhase"}>
                <Container>
                  <Row>
                    <Col xs={11}>
                      <Tooltip
                        multiline
                        width={220}
                        withArrow
                        transition="fade"
                        transitionDuration={200}
                        label={
                          this.state.extensionsMap[documentationPhase].comment
                        }
                      >
                        <Text>
                        {this.state.extensionsMap[documentationPhase].label}</Text>
                      </Tooltip>
                    </Col>
                    <Col xs={1}>
                      <Button
                        variant="light"
                        onClick={() => {
                          this.setState({
                            genericDeleteScreen_documentationPhase: true,
                          });
                          this.setState({
                            genericDeleteScreen_documentationPhase_item:
                              documentationPhase,
                          });
                        }}
                      >
                        <FaMinus />
                      </Button>
                      <GenericDeleteForm
                        show={this.state.genericDeleteScreen_documentationPhase}
                        item="documentation phase"
                        deleteValue={
                          this.state.genericDeleteScreen_documentationPhase_item
                        }
                        bcfOWLProperty="hasStage"
                        onHide={() =>
                          this.setState({
                            genericDeleteScreen_documentationPhase: false,
                          })
                        }
                      />
                    </Col>
                  </Row>
                </Container>
              </ListGroup.Item>
            );
          }
        } else {return (<></>)}
      }
    );

    const priorities_list = this.state.priorities.map((priority) => {
      return (
        <ListGroup.Item key={priority + "_priority"}>
          <Container>
            <Row>
              <Col xs={11}>
                <Tooltip
                  multiline
                  width={220}
                  withArrow
                  transition="fade"
                  transitionDuration={200}
                  label={this.state.extensionsMap[priority].comment}
                >
                  <Text>
                  {this.state.extensionsMap[priority].label}</Text>
                </Tooltip>
              </Col>
              <Col xs={1}>
                <Button
                  variant="light"
                  onClick={() => {
                    this.setState({ genericDeleteScreen_priorities: true });
                    this.setState({
                      genericDeleteScreen_priorities_item: priority,
                    });
                  }}
                >
                  <FaMinus />
                </Button>
                <GenericDeleteForm
                  show={this.state.genericDeleteScreen_priorities}
                  item="priority"
                  deleteValue={this.state.genericDeleteScreen_priorities_item}
                  bcfOWLProperty="hasPriority"
                  onHide={() =>
                    this.setState({ genericDeleteScreen_priorities: false })
                  }
                />
              </Col>
            </Row>
          </Container>
        </ListGroup.Item>
      );
    });

    const labels_list = this.state.labels.map((label) => {
      return (
        <ListGroup.Item key={label + "_label"}>
          <Container>
            <Row>
              <Col xs={11}>
                <Tooltip
                  multiline
                  width={220}
                  withArrow
                  transition="fade"
                  transitionDuration={200}
                  label={this.state.extensionsMap[label].comment}
                >
                  <Text>
                  {this.state.extensionsMap[label].label}</Text>
                </Tooltip>
              </Col>
              <Col xs={1}>
                <Button
                  variant="light"
                  onClick={() => {
                    this.setState({ genericDeleteScreen_labels: true });
                    this.setState({ genericDeleteScreen_labels_item: label });
                  }}
                >
                  <FaMinus />
                </Button>
                <GenericDeleteForm
                  show={this.state.genericDeleteScreen_labels}
                  item="label"
                  deleteValue={this.state.genericDeleteScreen_labels_item}
                  bcfOWLProperty="hasLabels"
                  onHide={() =>
                    this.setState({ genericDeleteScreen_labels: false })
                  }
                />
              </Col>
            </Row>
          </Container>
        </ListGroup.Item>
      );
    });

    return (
      <ScrollArea
        type="always"
        scrollbarSize={10}
        style={{
          display: "flex",
          alignContent: "stretch",
          justifyContent: "space-evenly",
          alignItems: "stretch",
          flexDirection: "column",
        }}
        styles={{
          root: { color: "red" },
          corner: { color: "red" },
          viewport: { color: "red" },
          scrollbar: { color: "red" },
          thumb: { color: "red" },
        }}
      >
        <div>
          <AddUserForm
            show={this.state.addUserScreen}
            onHide={() => this.setState({ addUserScreen: false })}
          />
          <DeleteUserForm
            show={this.state.deleteUserScreen}
            item={this.state.currentItem}
            deleteValue={this.state.selectedDeleteValue}
            onHide={() => this.setState({ deleteUserScreen: false })}
          />

          <Container>
            <Row>
              <Col>
                <Card
                  className="caia_card mx-auto my-2"
                  text="dark"
                  style={{ width: "30rem" }}
                >
                  <Card.Body>
                    <Card.Title>General Settings</Card.Title>
                    <Form onSubmit={this.submitted}>
                      <Form.Group className="mb-3" controlId="formProjectName">
                        <Form.Label>Project Name</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter the project name"
                          defaultValue={this.state.projectName}
                          onChange={this.handleName}
                        />
                        <Form.Text className="text-muted">
                          The name of the BCF project.
                        </Form.Text>
                      </Form.Group>
                      <Button variant="outline-dark" type="submit">
                        Save name
                      </Button>
                    </Form>
                  </Card.Body>
                </Card>
              </Col>{" "}
              <Col>
                <Card
                  className="caia_card mx-auto my-2"
                  text="dark"
                  style={{ width: "30rem" }}
                >
                  <Card.Body>
                    <Card.Title>Project Users</Card.Title>
                    <ListGroup as="ol">{users_list}</ListGroup>

                    <Button
                      variant="outline-dark"
                      onClick={() => this.setState({ addUserScreen: true })}
                    >
                      <FaPlus />
                    </Button>
                  </Card.Body>
                </Card>
              </Col>{" "}
              <Col>
                <Card
                  className="caia_card mx-auto my-2"
                  text="dark"
                  style={{ width: "30rem" }}
                >
                  <Card.Body>
                    <Card.Title>Topic Types</Card.Title>
                    <ListGroup as="ol">{topictype_list}</ListGroup>
                    <Button
                      variant="outline-dark"
                      onClick={() => {
                        this.setState({ genericAddScreen_topicType: true });
                      }}
                    >
                      <FaPlus />
                    </Button>
                    <GenericAddForm
                      show={this.state.genericAddScreen_topicType}
                      item="topic type"
                      bcfOWLProperty="hasTopicType"
                      bcfOWLSubject="TopicType"
                      onHide={() =>
                        this.setState({ genericAddScreen_topicType: false })
                      }
                    />
                  </Card.Body>
                </Card>
              </Col>{" "}
              <Col>
                <Card
                  className="caia_card mx-auto my-2"
                  text="dark"
                  style={{ width: "30rem" }}
                >
                  <Card.Body>
                    <Card.Title>Topic Statuses</Card.Title>
                    <ListGroup as="ol">{topicstatus_list}</ListGroup>
                    <Button
                      variant="outline-dark"
                      onClick={() => {
                        this.setState({ genericAddScreen_topicStatus: true });
                      }}
                    >
                      <FaPlus />
                    </Button>
                    <GenericAddForm
                      show={this.state.genericAddScreen_topicStatus}
                      item="topic status"
                      bcfOWLProperty="hasTopicStatus"
                      bcfOWLSubject="TopicStatus"
                      onHide={() =>
                        this.setState({ genericAddScreen_topicStatus: false })
                      }
                    />
                  </Card.Body>
                </Card>
              </Col>{" "}
              <Col>
                <Card
                  className="caia_card mx-auto my-2"
                  text="dark"
                  style={{ width: "30rem" }}
                >
                  <Card.Body>
                    <Card.Title>Documentation phases</Card.Title>
                    <ListGroup as="ol">{documentationphase_list}</ListGroup>
                    <Button
                      variant="outline-dark"
                      onClick={() => {
                        this.setState({
                          genericAddScreen_documentationPhase: true,
                        });
                      }}
                    >
                      <FaPlus />
                    </Button>
                    <GenericAddForm
                      show={this.state.genericAddScreen_documentationPhase}
                      item="documentation phase"
                      bcfOWLProperty="hasStage"
                      bcfOWLSubject="Stage"
                      onHide={() =>
                        this.setState({
                          genericAddScreen_documentationPhase: false,
                        })
                      }
                    />
                  </Card.Body>
                </Card>
              </Col>{" "}
              <Col>
                <Card
                  className="caia_card mx-auto my-2"
                  text="dark"
                  style={{ width: "30rem" }}
                >
                  <Card.Body>
                    <Card.Title>Priorities</Card.Title>
                    <ListGroup as="ol">{priorities_list}</ListGroup>
                    <Button
                      variant="outline-dark"
                      onClick={() => {
                        this.setState({ genericAddScreen_priorities: true });
                      }}
                    >
                      <FaPlus />
                    </Button>
                    <GenericAddForm
                      show={this.state.genericAddScreen_priorities}
                      item="priority"
                      bcfOWLProperty="hasPriority"
                      bcfOWLSubject="Priority"
                      onHide={() =>
                        this.setState({ genericAddScreen_priorities: false })
                      }
                    />
                  </Card.Body>
                </Card>
              </Col>{" "}
              <Col>
                <Card
                  className="caia_card mx-auto my-2"
                  text="dark"
                  style={{ width: "30rem" }}
                >
                  <Card.Body>
                    <Card.Title>Labels</Card.Title>
                    <ListGroup as="ol">{labels_list}</ListGroup>
                    <Button
                      variant="outline-dark"
                      onClick={() => {
                        this.setState({ genericAddScreen_labels: true });
                      }}
                    >
                      <FaPlus />
                    </Button>
                    <GenericAddForm
                      show={this.state.genericAddScreen_labels}
                      item="label"
                      bcfOWLProperty="hasLabels"
                      bcfOWLSubject="Label"
                      onHide={() =>
                        this.setState({ genericAddScreen_labels: false })
                      }
                    />
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </ScrollArea>
    );
  }

  componentDidMount() {
    this.update();
  }

  update() {
    this.bcfowl_setup.getCurrentProject().then((value) => {
      this.setState({ projectName: value.hasName });
      this.bcfowl_setup.getCurrentProjectExtensions().then((extensions) => {
        let extensionList: any[] = extensions["@graph"];
        let tempExtensions = this.state.extensionsMap;

        extensionList.forEach((extension) => {
          tempExtensions[extension["@id"]] = extension;
        });

        this.setState({ extensionsMap: tempExtensions });

        if (value.hasTopicType) {
          if (!Array.isArray(value.hasTopicType))
            value.hasTopicType = [value.hasTopicType];
          let list: string[] = [];
          value.hasTopicType.forEach((tturl: string) => {
            //let typename = tturl.substring(tturl.lastIndexOf("/") + 1);
            list = list.concat(tturl);
          });
          this.setState({ topicTypes: list });
        }

        if (value.hasTopicStatus) {
          if (!Array.isArray(value.hasTopicStatus))
            value.hasTopicStatus = [value.hasTopicStatus];
          let list: string[] = [];
          value.hasTopicStatus.forEach((tsurl: string) => {
            //let typestatus = tsurl.substring(tsurl.lastIndexOf("/") + 1);
            list = list.concat(tsurl);
          });
          this.setState({ topicStatuses: list });
        }

        if (value.hasStage) {
          if (!Array.isArray(value.hasStage)) value.hasStage = [value.hasStage];
          let list: string[] = [];
          value.hasStage.forEach((dsurl: string) => {
            //let stage = dsurl.substring(dsurl.lastIndexOf("/") + 1);
            list = list.concat(dsurl);
          });
          this.setState({ documentationPhases: list });
        }

        if (value.hasPriority) {
          if (!Array.isArray(value.hasPriority))
            value.hasPriority = [value.hasPriority];
          let list: string[] = [];
          value.hasPriority.forEach((purl: string) => {
            //let priority = purl.substring(purl.lastIndexOf("/") + 1);
            list = list.concat(purl);
          });
          this.setState({ priorities: list });
        }

        if (value.hasLabels) {
          if (!Array.isArray(value.hasLabels))
            value.hasLabels = [value.hasLabels];
          let list: string[] = [];
          value.hasLabels.forEach((lurl: string) => {
            //let label = lurl.substring(lurl.lastIndexOf("/") + 1);
            list = list.concat(lurl);
          });
          this.setState({ labels: list });
        }

        try {
          if (!Array.isArray(value.hasUser)) value.hasUser = [value.hasUser];
          let list: string[] = [];
          value.hasUser.forEach((user: string) => {
            this.bcfowl.describeUser(user).then((u) => {
              list = list.concat(u);
              this.setState({ projectUsers: list });
            });
          });
        } catch (e) {
        }
      });
    });
  }
}

export default SetupView;
