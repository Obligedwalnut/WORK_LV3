const express = require("express");
const router = express.Router();
const { Posts } = require("../models");
const verifyToken = require("../middlewares/auth_middleware");

// 전체 게시글 목록 조회
router.get("/posts", async (req, res) => {
  try {
    const posts = await Posts.findAll({
        attributes: ["postId", "userId", "nickname", "title", "createdAt", "updatedAt"],
        order: [['createdAt', 'DESC']], // createdAt기준 DESC내림차순 정렬 
    });

    return res.status(200).json({ data: posts });
} catch (err) {
    console.log(err);
    return res
        .status(400)
        .json({ errorMessage: "게시글 조회에 실패하였습니다." });
}
});

// 게시글 작성
router.post("/posts", verifyToken, async (req, res) => {  
  const { title, content, } = req.body;  
  const { userId,nickname} = res.locals.user 
  
  try {
    const post = new Posts({ UserId:userId, title, content, nickname });
    await post.save();
    res.status(201).json({ message: "게시글이 작성되었습니다." });    
  } catch (error) {
    res.status(401).json({message: "1111"})
    console.log(error)
  }
});

// 게시글 상세 조회
router.get("/posts/:postId", async (req, res) => {
  const { postId } = req.params;

  try {    
    const post = await Posts.findOne({
        attributes: ["postId", "userId", "nickname", "title", "content", "createdAt", "updatedAt"],
        where: { postId }
    });

    return res.status(200).json({ data: post });
} catch (err) {
    console.log(err);
    return res
        .status(400)
        .json({ errorMessage: "게시글 조회에 실패하였습니다." });
}
});

// 게시글 수정
router.put("/posts/:postId", verifyToken, async (req, res) => {
  const { postId } = req.params;
  const { title, content } = req.body;
  const {nickname} = res.locals.user

  try {
    const post = await Posts.findOne({where : {postId}});

    if (!post) {
      return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    }

    if (post.nickname !== nickname) {
      return res.status(403).json({ message: "권한이 없습니다." });
    }

    post.title = title;
    post.content = content;
    await post.save();

    res.json({ message: "게시글이 수정되었습니다." });
  } catch (error) {
    console.log(error);
  }
});

// 게시글 삭제
router.delete("/posts/:postId", verifyToken, async (req, res) => {
  const { postId } = req.params;
  const {nickname} = res.locals.user

  try {
    const post = await Posts.findOne({where :{postId}});

    if (!post) {
      return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    }

    if (post.nickname !== nickname) {
      return res.status(403).json({ message: "권한이 없습니다." });
    }

    await Posts.destroy({where:{postId}})

    res.json({ message: "게시글이 삭제되었습니다." });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
