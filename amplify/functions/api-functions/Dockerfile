FROM public.ecr.aws/lambda/nodejs:12  

WORKDIR /app

COPY . ${LAMBDA_TASK_ROOT}/

RUN npm install 

CMD ["handler.handler"]