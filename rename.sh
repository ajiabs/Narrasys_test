for file in *.ts
do
 mv "$file" "${file%.ts.spec.ts}.spec.ts"
done
