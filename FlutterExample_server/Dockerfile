# 此階段用於以快速模式從 VS 執行時 (偵錯設定的預設值)
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080
EXPOSE 8081


# 此階段是用來組建服務專案
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["FlutterExample_server/FlutterExample_server.csproj", "FlutterExample_server/"]
RUN dotnet restore "./FlutterExample_server/FlutterExample_server.csproj"
COPY . .
WORKDIR "/src/FlutterExample_server"
RUN dotnet build "./FlutterExample_server.csproj" -c $BUILD_CONFIGURATION -o /app/build

# 此階段可用來發佈要複製到最終階段的服務專案
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./FlutterExample_server.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# 此階段用於生產環境，或以一般模式從 VS 執行時 (未使用偵錯設定時的預設值)
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "FlutterExample_server.dll"]