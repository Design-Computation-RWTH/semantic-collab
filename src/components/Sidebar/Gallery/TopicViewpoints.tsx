import Cookies from "js-cookie";
import React from "react";
import Figure from "react-bootstrap/Figure";
import ImageService from "../../../services/ImageService";
import BCFAPIService from "../../../services/BCFApIService";


export const getAccessToken = () => Cookies.get('access_token')
type TopicViewpointsListProps = {
    topic_id: string
};

type TopicViewpointsListState = {
    viewpoints: any[],
    snapshots: any[],
    topic_id: string
};

class TopicViewpointsList extends React.Component<TopicViewpointsListProps,TopicViewpointsListState> {
    private imageservice: ImageService;

    constructor(props: TopicViewpointsListProps | Readonly<TopicViewpointsListProps>) {
        super(props);
        this.imageservice=new ImageService();

        this.state = {
            viewpoints: [],
            snapshots: [],
            topic_id: props.topic_id
        };
    }

    render() {
        {
            const listItems = this.state.snapshots.map((s) =>
                    <Figure key={"topic-image:"+s.guid}>
                        <Figure.Image
                            width={171}
                            height={180}
                            alt="171x180"
                            src={s}
                        />
                    </Figure>
            );
            return (
                <div>
                        {listItems}
                </div>
            );
        }
    }



    componentDidMount() {
        let bcfapi=new BCFAPIService();
        bcfapi.getTopicViewPoints(this.state.topic_id)
            .then(value => {
                value.forEach((tv: { guid: string; }) =>
                    {
                        let snapshot=this.imageservice.getThumbnailData(tv.guid);
                        snapshot.then(img=> {
                                let url = URL.createObjectURL(img);
                            if(img.size >0) {
                                let joined = this.state.snapshots.concat(url);
                                this.setState({snapshots: joined});
                                }
                                }
                            )
                        }
                    );
                })
            .catch(err => {
                console.log(err)
            });
    }
}

export default TopicViewpointsList;