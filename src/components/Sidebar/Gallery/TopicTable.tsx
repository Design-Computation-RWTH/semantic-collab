import React from "react";
import BcfOWLService from "../../../services/BcfOWLService";
import {Table} from "react-bootstrap";
// @ts-ignore
import {ReactSession} from "react-client-session";
import PubSub from "pubsub-js";

let topictable_component:any=null;

type TopicTableProps = {
    topic_guid:string;
};

type TopicTableState = {
    topic_guid: string;
    data: any;
};


class TopicTable extends React.Component<TopicTableProps, TopicTableState>  {
    private project_id: any;
    private readonly subSelectedTopicID: any;

    constructor(props: TopicTableProps | Readonly<TopicTableProps>) {
        super(props);
        this.state = {
            topic_guid: props.topic_guid,
            data: [],

    };
        topictable_component=this;
        this.project_id = ReactSession.get("projectid");
        this.subSelectedTopicID = PubSub.subscribe('SelectedTopicID', this.subTopicID);
    }

    componentWillUnmount() {
        PubSub.unsubscribe(this.subSelectedTopicID);
    }


    subTopicID(msg: any, data: { topic_guid: string; }) {
        console.log("subTOPIC: "+data.topic_guid);
        if(data.topic_guid===topictable_component.state.topic_guid)
            return;
        let bcfowl=new BcfOWLService();
        topictable_component.setState({data: []});
        topictable_component.setState({topic_guid: data.topic_guid});
        bcfowl.getTopicByGUID(topictable_component.state.topic_guid).then(topic => {
            Object.getOwnPropertyNames(topic).forEach(p => {
                if(p!=='@context' && !p.startsWith("@")) {
                    let val = topic[p];
                    let pstr =  p;
                    if (p.startsWith("has")) {
                        pstr = p.slice("has".length);
                    }

                    let valstr =  val.replaceAll("https://caia.herokuapp.com/graph/"+topictable_component.project_id +"/","");
                    valstr  = valstr.replaceAll("https://caia.herokuapp.com/users/","");
                    let joined = topictable_component.state.data.concat({prop: pstr, value: valstr});
                    topictable_component.setState({data: joined});
                    }
                }
            )
        });

    };

    render() {
            const listRows = this.state.data.map((r: { prop: string; value: string }) =>
                <tr>
                    <td className="caia_tablefont">{r.prop}</td>
                    <td className="caia_tablefont">{r.value}</td>
                </tr>

            );
            return (
                <div>
                    <Table striped bordered hover size="sm">
                    <tbody>
                    {listRows}
                    </tbody>
                </Table>
                </div>
            );
    }



    componentDidMount() {
        let bcfowl=new BcfOWLService();
        this.setState({data: []});
        bcfowl.getTopicByGUID(this.state.topic_guid)
                .then(topic => {
                Object.getOwnPropertyNames(topic).forEach(p => {
                    if(p!=='@context' && !p.startsWith("@")) {
                        let val:string = topic[p];
                        let pstr:string =  p;
                        if (p.startsWith("has")) {
                            pstr = p.slice("has".length);
                        }
                        if(pstr === "Guid")
                            return;
                        if(pstr === "Project")
                            return;

                        let valstr:string =  val.replaceAll("https://caia.herokuapp.com/graph/"+this.project_id +"/","");


                        if(val.startsWith("https://caia.herokuapp.com/users/"))
                        {
                            bcfowl.describeUser(val)
                                .then(user=>{
                                     valstr=user.name;
                                    let joined = this.state.data.concat({prop: pstr, value: valstr});
                                    this.setState({data: joined});
                                })
                                .catch(err => {
                                    console.log(err)
                                });
                        }
                        else
                        {
                            if(pstr.includes("Date"))
                            {
                                try {
                                    let time=new Date(valstr);
                                    let valorg=valstr;
                                    valstr=time.toLocaleDateString('en-US')+" "+time.toLocaleTimeString('en-US');
                                    const weekday = new Array(7);
                                    weekday[0] = "Sunday";
                                    weekday[1] = "Monday";
                                    weekday[2] = "Tuesday";
                                    weekday[3] = "Wednesday";
                                    weekday[4] = "Thursday";
                                    weekday[5] = "Friday";
                                    weekday[6] = "Saturday";

                                    let day = weekday[time.getDay()];
                                    valstr+=" "+day;
                                    if(valstr==="Invalid Date Invalid Date undefined")
                                        valstr=valorg;

                                }
                                catch (e) {
                                   console.log("Date time format error "+e)
                                }

                            }
                            let joined = this.state.data.concat({prop: pstr, value: valstr});
                            this.setState({data: joined});

                        }
                    }
                }
            )
        })
            .catch(err => {
                console.log(err)
            });
    }
}

export default TopicTable;