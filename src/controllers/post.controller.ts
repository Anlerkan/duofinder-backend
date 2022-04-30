import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { FilterQuery, ObjectId } from 'mongoose';

import { InvalidInput } from '../errors';
import NotFoundError from '../errors/not-found';
import PaginatedResultEvent from '../events/paginated-result';
import { IPost, Post, PostDocument, PostResponse } from '../models';
import likeService from '../services/LikeService';
import postService from '../services/PostService';
import userService from '../services/UserService';
import { getPaginationParamsFromRequest } from '../utils/pagination/getPaginationParamsFromRequest';

export async function getPosts(req: Request, res: Response) {
  const { limit, offset, search, ordering } = getPaginationParamsFromRequest(req);
  const currentUser = await userService.findOne({ _id: req.userId });

  const posts = await Post.find({
    content: new RegExp(search || '', 'i')
  } as FilterQuery<PostDocument>)
    .limit(limit)
    .skip(offset)
    .sort(ordering)
    .populate('author');

  const serializedPosts: PostResponse[] = await Promise.all(
    posts.map(async (post) => {
      const { _id: id, likeCount, commentCount, content, author, createdAt } = post;

      const isLikedByViewer =
        Boolean(currentUser) &&
        (await likeService.isLikedByUser((post._id as unknown) as ObjectId, currentUser!));

      return {
        author,
        content,
        createdAt,
        id,
        likeCount,
        likedByViewer: isLikedByViewer,
        commentCount
      };
    })
  );

  const paginatedResultEvent = new PaginatedResultEvent<PostResponse>({
    items: serializedPosts,
    count: await Post.countDocuments({
      content: new RegExp(search || '', 'i')
    } as FilterQuery<PostDocument>),
    offset,
    limit,
    req,
    search
  });

  return res
    .status(paginatedResultEvent.getStatusCode())
    .send(paginatedResultEvent.serializeRest());
}

export async function addPost(req: Request<any, IPost, Omit<IPost, 'createdAt'>>, res: Response) {
  const errors = validationResult(req).array();
  const currentUser = await userService.findOne({ _id: req.userId });

  if (errors.length > 0) {
    throw new InvalidInput(errors);
  }

  const { content } = req.body;

  const newPost = await postService.create({
    content,
    author: currentUser!
  });

  const { _id: id, likeCount, commentCount, content: postContent, author, createdAt } = newPost;

  return res.status(200).send({
    author,
    content: postContent,
    createdAt,
    id,
    likeCount,
    likedByViewer: false,
    commentCount
  });
}

export async function getPostById(req: Request, res: Response) {
  const post = await postService.findOne({ _id: req.params.id });
  const currentUser = await userService.findOne({ _id: req.userId });

  if (!post) {
    throw new NotFoundError('Post not found');
  }

  const isLikedByViewer =
    Boolean(currentUser) &&
    (await likeService.isLikedByUser((req.params.id as unknown) as ObjectId, currentUser!));

  const { _id: id, likeCount, commentCount, content, author, createdAt } = post;

  return res.status(200).send({
    author,
    content,
    createdAt,
    id,
    likeCount,
    likedByViewer: isLikedByViewer,
    commentCount
  });
}

export async function likePost(req: Request, res: Response) {
  const currentUser = await userService.findOne({ _id: req.userId });

  if (!currentUser) {
    throw new NotFoundError('User not found');
  }

  const likedPost = await postService.likePost((req.params.id as unknown) as ObjectId, currentUser);

  const { _id: id, likeCount, commentCount, content, author, createdAt } = likedPost!;

  return res.status(200).send({
    author,
    content,
    createdAt,
    id,
    likeCount,
    likedByViewer: true,
    commentCount
  });
}

export async function unlikePost(req: Request, res: Response) {
  const currentUser = await userService.findOne({ _id: req.userId });

  if (!currentUser) {
    throw new NotFoundError('User not found');
  }

  const unlikedPost = await postService.unlikePost(
    (req.params.id as unknown) as ObjectId,
    currentUser
  );

  if (!unlikedPost) {
    throw new NotFoundError('Post not found');
  }

  const { _id: id, likeCount, commentCount, content, author, createdAt } = unlikedPost;

  return res.status(200).send({
    author,
    content,
    createdAt,
    id,
    likeCount,
    likedByViewer: false,
    commentCount
  });
}

export async function getLikedUsers(req: Request, res: Response) {
  const likedUsers = await postService.getLikedUsers((req.params.id as unknown) as ObjectId);

  return res.status(200).send(likedUsers);
}

export async function getCurrentUserPosts(req: Request, res: Response) {
  const currentUser = await userService.findOne({ _id: req.userId });

  if (!currentUser) {
    throw new NotFoundError('User not found');
  }

  const { paginatedResultEvent } = await postService.getPaginatedResult(
    getPaginationParamsFromRequest(req),
    req,
    'content',
    {
      author: currentUser._id
    }
  );

  return res
    .status(paginatedResultEvent.getStatusCode())
    .send(paginatedResultEvent.serializeRest());
}

export async function getPostsByUser(req: Request, res: Response) {
  const user = await userService.findOne({ username: req.params.username });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  const { paginatedResultEvent } = await postService.getPaginatedResult(
    getPaginationParamsFromRequest(req),
    req,
    'content',
    {
      author: user._id
    }
  );

  return res
    .status(paginatedResultEvent.getStatusCode())
    .send(paginatedResultEvent.serializeRest());
}
