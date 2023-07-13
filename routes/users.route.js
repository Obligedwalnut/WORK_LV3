const express = require("express");
const router = express.Router();
const { Users } = require("../models");
const jwt = require("jsonwebtoken");

// 회원가입
router.post("/users", async (req, res) => {
  const { nickname, password, confirm } = req.body;
  try {
    if (!nickname || !password || !confirm) {
      return res
        .status(400)
        .json({ message: "닉네임과 비밀번호를 모두 입력해주세요." });
    }

    // 닉네임 길이 확인
    if (nickname.length < 3) {
      return res
        .status(400)
        .json({ message: "닉네임은 최소 3자 이상이어야 합니다." });
    }

    // 닉네임 정규식 검사
    if (!/^[a-zA-Z0-9]+$/.test(nickname)) {
      return res
        .status(400)
        .json({
          message: "닉네임은 알파벳 대소문자와 숫자로만 구성되어야 합니다.",
        });
    }

    // 비밀번호 길이 확인
    if (password.length < 4) {
      return res
        .status(400)
        .json({ message: "비밀번호는 최소 4자 이상이어야 합니다." });
    }

    // 비밀번호 확인
    if (password !== confirm) {
      return res.status(400).json({ message: "비밀번호가 일치하지 않습니다." });
    }

    // 중복된 닉네임인지 확인
    const existingUser = await Users.findOne({ nickname });
    if (existingUser) {
      return res.status(409).json({ message: "중복된 닉네임입니다." });
    }
    console.log("success")
    // 회원 생성
    await Users.create({ nickname, password });
    return res.status(201).json({ message: "회원 가입에 성공했습니다." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// 로그인
router.post("/login", async (req, res) => {
  const { nickname, password } = req.body;

  try {
    // 닉네임과 비밀번호가 존재하는지 확인
    if (!nickname || !password) {
      return res
        .status(400)
        .json({ message: "닉네임 또는 패스워드를 확인해주세요." });
    }

    // 유저 조회
    const user = await Users.findOne({ nickname, password });
    if (!user) {
      return res
        .status(401)
        .json({ message: "닉네임 또는 비밀번호를 확인해주세요." });
    }

    // JWT 토큰 생성 ////my secret key 개념이 뭐임 대체
    const token = jwt.sign({ nickname: user.nickname }, "my-secret-key");

    // 클라이언트에게 토큰을 쿠키로 전달
    res.cookie('Authorization', `Bearer ${token}`, {httpOnly:true});

    return res.status(200).json({ message: "로그인에 성공했습니다." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

module.exports = router;
