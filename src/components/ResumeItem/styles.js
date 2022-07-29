import styled from "styled-components";

export const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-itens: center;
    background-color: #fff;
    border-radius: 5px;
    padding: 5px 15px;
    width: 30%;

    @media (max-width: 750px) {
        width: 20%;

        p {
            font-size: 12px;
        }

        span {
            font-size: 20px;
        }

        svg {
            display: none;
        }
    }
`;

export const Header = styled.header`
    display: flex;
    align-itens: center;
    justify-content: space-around;
    width: 100%;
    gap: 10px;
    margin: 20px auto;

    svg {
        width: 25px;
        height: 25px;
    }
`;

export const HeaderTitle = styled.p`
    font-size: 20px;
    font-weight: bold;
`;

export const Total = styled.span`
    font-size: 42px;
    font-weight: 900;
    text-align: center;
`;

