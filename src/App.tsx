import { ConfigProvider, theme } from "antd";
import ProductsPage from "./pages/ProductsPage";

export default function App() {
    return (
        <ConfigProvider
            theme={{
                algorithm: theme.defaultAlgorithm, // или theme.darkAlgorithm
                token: {
                    colorPrimary: "#2a93b1",
                    borderRadius: 8,
                    colorBgContainer: "#f4fdffff",
                },
                components: {
                    Table: {
                        headerBg: "#1c1c1c12",
                        headerColor: "#363636",
                        headerBorderRadius: 10,
                        headerSplitColor: "transparent",
                    },
                },
            }}
        >
            <ProductsPage />
        </ConfigProvider>
    );
}
