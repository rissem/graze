import { createSystem, defaultConfig } from "@chakra-ui/react"
import { buttonRecipe } from "./theme/button.recipe"

// Create a modified config that preserves important defaults while preventing CSS resets
const modifiedConfig = {
  ...defaultConfig,
  globalCss: {}, // Override CSS reset with empty object to disable it
}

console.log("MODIFIED CONFIG", modifiedConfig)

export const system = createSystem(
  {},
  {
    globalCss: {
      html: {
        fontSize: "16px",
      },
      body: {
        fontSize: "0.875rem",
        margin: 0,
        padding: 0,
      },
      ".main-link": {
        color: "ui.main",
        fontWeight: "bold",
      },
    },
    theme: {
      tokens: {
        colors: {
          ui: {
            main: { value: "#009688" },
          },
        },
      },
      recipes: {
        button: buttonRecipe,
      },
    },
  },
)
