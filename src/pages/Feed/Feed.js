import React, { Component, Fragment } from "react";
import socketClient from "socket.io-client";
import Post from "../../components/Feed/Post/Post";
import Button from "../../components/Button/Button";
import FeedEdit from "../../components/Feed/FeedEdit/FeedEdit";
import Input from "../../components/Form/Input/Input";
import Paginator from "../../components/Paginator/Paginator";
import Loader from "../../components/Loader/Loader";
import ErrorHandler from "../../components/ErrorHandler/ErrorHandler";
import "./Feed.css";
import * as authService from "../../services/auth";
import * as feedService from "../../services/feed";
import { host } from "../../services/constants";

class Feed extends Component {
  state = {
    isEditing: false,
    posts: [],
    totalPosts: 0,
    editPost: null,
    status: "",
    postPage: 1,
    postsLoading: true,
    editLoading: false,
  };

  componentDidMount() {
    authService
      .getStatus(this.props.token)
      .then((resData) => {
        this.setState({ status: resData.status });
      })
      .catch(this.catchError);

    this.loadPosts();
    const socket = socketClient(host);
    socket.on("posts", (data) => {
      if (data.action === "create") {
        this.addPost(data.post);
      } else if (data.action === "update") {
        this.updatePost(data.post);
      } else if (data.action === "delete") {
        this.loadPosts();
      }
    });
  }

  addPost = (post) => {
    this.setState((prevState) => {
      const updatedPosts = [...prevState.posts];
      if (prevState.postPage === 1) {
        if (prevState.posts.length >= 2) {
          updatedPosts.pop();
        }
        updatedPosts.unshift(post);
      }
      return {
        posts: updatedPosts,
        totalPosts: prevState.totalPosts + 1,
      };
    });
  };

  updatePost = (post) => {
    this.setState((prevState) => {
      const updatedPosts = [...prevState.posts];
      const updatedPostIndex = updatedPosts.findIndex(
        (p) => p._id === post._id
      );
      if (updatedPostIndex > -1) {
        updatedPosts[updatedPostIndex] = post;
      }
      return {
        posts: updatedPosts,
      };
    });
  };

  loadPosts = (direction) => {
    if (direction) {
      this.setState({ postsLoading: true, posts: [] });
    }
    let page = this.state.postPage;
    if (direction === "next") {
      page++;
      this.setState({ postPage: page });
    }
    if (direction === "previous") {
      page--;
      this.setState({ postPage: page });
    }
    feedService
      .getFeeds(page, this.props.token)
      .then((resData) => {
        console.log(resData);
        this.setState({
          posts: resData.posts.map((post) => {
            return {
              ...post,
              imagePath: post.imageUrl,
            };
          }),
          totalPosts: resData.totalItems,
          postsLoading: false,
        });
      })
      .catch(this.catchError);
  };

  statusUpdateHandler = (event) => {
    event.preventDefault();
    authService
      .updateStatus(this.props.token, this.state.status)
      .then((resData) => {
        console.log(resData);
      })
      .catch(this.catchError);
  };

  newPostHandler = () => {
    this.setState({ isEditing: true });
  };

  startEditPostHandler = (postId) => {
    this.setState((prevState) => {
      const loadedPost = { ...prevState.posts.find((p) => p._id === postId) };

      return {
        isEditing: true,
        editPost: loadedPost,
      };
    });
  };

  cancelEditHandler = () => {
    this.setState({ isEditing: false, editPost: null });
  };

  finishEditHandler = (postData) => {
    this.setState({
      editLoading: true,
    });
    feedService
      .saveFeed({
        postData,
        token: this.props.token,
        id: this.state.editPost ? this.state.editPost._id : null,
      })
      .then((resData) => {
        this.setState((prevState) => {
          return {
            isEditing: false,
            editPost: null,
            editLoading: false,
          };
        });
      })
      .catch((err) => {
        console.log(err);
        this.setState({
          isEditing: false,
          editPost: null,
          editLoading: false,
          error: err,
        });
      });
  };

  statusInputChangeHandler = (input, value) => {
    this.setState({ status: value });
  };

  deletePostHandler = (postId) => {
    this.setState({ postsLoading: true });
    feedService
      .deleteFeed(postId, this.props.token)
      .then((resData) => {
        console.log(resData);
        // this.setState((prevState) => {
        //   const updatedPosts = prevState.posts.filter((p) => p._id !== postId);
        //   return { posts: updatedPosts, postsLoading: false };
        // });
        this.loadPosts();
      })
      .catch((err) => {
        console.log(err);
        this.setState({ postsLoading: false });
      });
  };

  errorHandler = () => {
    this.setState({ error: null });
  };

  catchError = (error) => {
    this.setState({ error: error });
  };

  render() {
    return (
      <Fragment>
        <ErrorHandler error={this.state.error} onHandle={this.errorHandler} />
        <FeedEdit
          editing={this.state.isEditing}
          selectedPost={this.state.editPost}
          loading={this.state.editLoading}
          onCancelEdit={this.cancelEditHandler}
          onFinishEdit={this.finishEditHandler}
        />
        <section className="feed__status">
          <form onSubmit={this.statusUpdateHandler}>
            <Input
              type="text"
              placeholder="Your status"
              control="input"
              onChange={this.statusInputChangeHandler}
              value={this.state.status}
            />
            <Button mode="flat" type="submit">
              Update
            </Button>
          </form>
        </section>
        <section className="feed__control">
          <Button mode="raised" design="accent" onClick={this.newPostHandler}>
            New Post
          </Button>
        </section>
        <section className="feed">
          {this.state.postsLoading && (
            <div style={{ textAlign: "center", marginTop: "2rem" }}>
              <Loader />
            </div>
          )}
          {this.state.posts.length <= 0 && !this.state.postsLoading ? (
            <p style={{ textAlign: "center" }}>No posts found.</p>
          ) : null}
          {!this.state.postsLoading && (
            <Paginator
              onPrevious={this.loadPosts.bind(this, "previous")}
              onNext={this.loadPosts.bind(this, "next")}
              lastPage={Math.ceil(this.state.totalPosts / 2)}
              currentPage={this.state.postPage}
            >
              {this.state.posts.map((post) => (
                <Post
                  key={post._id}
                  id={post._id}
                  author={
                    localStorage.getItem("userId") === post.creator._id
                      ? "You"
                      : post.creator.name
                  }
                  date={new Date(post.createdAt).toLocaleDateString("en-US")}
                  title={post.title}
                  image={post.imageUrl}
                  content={post.content}
                  onStartEdit={this.startEditPostHandler.bind(this, post._id)}
                  onDelete={this.deletePostHandler.bind(this, post._id)}
                />
              ))}
            </Paginator>
          )}
        </section>
      </Fragment>
    );
  }
}

export default Feed;
