//import Cookies from "js-cookie";
import React from "react";
import Accordion from "react-bootstrap/Accordion";
import BCFAPIService from "../../../services/BCFApIService";


//export const getAccessToken = () => Cookies.get('access_token')

type TopicCommentsListProps = {
    topic_id: string;
};

type TopicCommentsListState = {
    comments:any;
};


class TopicCommentsList extends React.Component<TopicCommentsListProps, TopicCommentsListState> {
    private inx: number;

    constructor(props: TopicCommentsListProps | Readonly<TopicCommentsListProps>) {
        super(props);
        this.inx=0;
        this.state = {
            comments: []
        }
    }


    render() {
        if(Array.isArray(this.state.comments)) {
            const listItems = this.state.comments.map((tc) =>
                <Accordion.Item eventKey={"topic-comment:"+tc.quid+(this.inx++)}>
                    <Accordion.Header>Comment: {tc.date}</Accordion.Header>
                    <Accordion.Body>
                        <p>
                            <b>Author:</b> {tc.author}
                        </p>
                        <p>
                            {tc.comment}
                        </p>
                    </Accordion.Body>
                </Accordion.Item>
            );
            return (
                <div>
                    <Accordion defaultActiveKey="0">
                        {listItems}
                    </Accordion>
                </div>
            );
        }
    }


    componentDidMount() {
        let bcfapi=new BCFAPIService();
        bcfapi.getTopicComments(this.props.topic_id)
            .then(value => {
                this.setState({ comments: value });
            })
            .catch(err => {
                console.log(err)
            });
    }
}

export default TopicCommentsList;