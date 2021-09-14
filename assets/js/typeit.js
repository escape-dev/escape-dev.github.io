new TypeIt("#type-it", {
  speed: 75,
  waitUntilVisible: true,
})
  .pause(2000)
  .type("Wwb", { delay: 500 })
  .move(-1)
  .delete(1)
  .type("e")
  .move(null, { to: "END" })
  .type(" Devlopr", {delay: 500})
  .move(-4)
  .type("e")
  .move(3)
  .type("e")
  .move(null, { to: "END" })
  .pause(300)
  .go();