import React, { Component } from "react";

import Image from "../../../components/Image/Image";
import "./SinglePost.css";
import { host } from "../../../services/constants";
import { getFeedById } from "../../../services/feed";

class SinglePost extends Component {
  state = {
    title: "",
    author: "",
    date: "",
    image: "",
    content: "",
  };

  componentDidMount() {
    const postId = this.props.match.params.postId;
    getFeedById(postId, this.props.token)
      .then((resData) => {
        this.setState({
          title: resData.post.title,
          author: resData.post.creator.name,
          image: `${host}/${resData.post.imageUrl}`,
          date: new Date(resData.post.createdAt).toLocaleDateString("en-US"),
          content: resData.post.content,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  render() {
    return (
      <section className="single-post">
        <h1>{this.state.title}</h1>
        <h2>
          Created by {this.state.author} on {this.state.date}
        </h2>
        <div className="single-post__image">
          <Image contain imageUrl={this.state.image} />
        </div>
        <p>{this.state.content}</p>
      </section>
    );
  }
}

export default SinglePost;
