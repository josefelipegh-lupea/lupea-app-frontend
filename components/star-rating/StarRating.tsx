const StarRating = ({ rating = 4.8 }) => {
  const fillPercentage = (rating / 5) * 100;
  const starPath =
    "M11.4994 22.4305L5.92492 25.7937C5.67866 25.9507 5.4212 26.0179 5.15255 25.9955C4.8839 25.9731 4.64883 25.8834 4.44735 25.7264C4.24586 25.5695 4.08914 25.3735 3.97721 25.1385C3.86527 24.9036 3.84288 24.6399 3.91004 24.3475L5.38762 17.991L0.451166 13.7197C0.227291 13.5179 0.0875924 13.2879 0.0320712 13.0296C-0.0234499 12.7713 -0.00688319 12.5193 0.0817716 12.2735C0.170426 12.0278 0.304752 11.826 0.484748 11.6682C0.664744 11.5103 0.911007 11.4094 1.22354 11.3655L7.73832 10.7937L10.2569 4.80717C10.3689 4.53812 10.5426 4.33632 10.7781 4.20179C11.0136 4.06726 11.2541 4 11.4994 4C11.7448 4 11.9852 4.06726 12.2208 4.20179C12.4563 4.33632 12.63 4.53812 12.7419 4.80717L15.2605 10.7937L21.7753 11.3655C22.0887 11.4103 22.335 11.5112 22.5141 11.6682C22.6932 11.8251 22.8275 12.0269 22.9171 12.2735C23.0066 12.5202 23.0236 12.7726 22.9681 13.0309C22.9126 13.2892 22.7725 13.5188 22.5477 13.7197L17.6112 17.991L19.0888 24.3475C19.156 24.639 19.1336 24.9027 19.0216 25.1385C18.9097 25.3744 18.753 25.5704 18.5515 25.7264C18.35 25.8825 18.115 25.9722 17.8463 25.9955C17.5777 26.0188 17.3202 25.9516 17.0739 25.7937L11.4994 22.4305Z";

  const starPositions = [0, 26, 52, 78, 104];

  return (
    // Quitamos el ancho fijo de 130px y usamos 100%
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "150px",
        height: "30px",
      }}
    >
      {/* 1. Capa de fondo */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 130 30"
        preserveAspectRatio="xMinYMid meet"
      >
        {starPositions.map((x, i) => (
          <path
            key={`bg-${i}`}
            d={starPath}
            transform={`translate(${x}, 0)`}
            fill="#E2E8F0"
          />
        ))}
      </svg>

      {/* 2. Capa superior (Recorte dinámico) */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: `${fillPercentage}%`,
          height: "100%",
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        {/* El SVG de arriba debe medir lo mismo que el de abajo para que coincidan las estrellas */}
        <svg
          width="130px"
          height="30px"
          viewBox="0 0 130 30"
          style={{ display: "block" }}
        >
          {starPositions.map((x, i) => (
            <path
              key={`fill-${i}`}
              d={starPath}
              transform={`translate(${x}, 0)`}
              fill="#F08400"
            />
          ))}
        </svg>
      </div>
    </div>
  );
};

export default StarRating;
